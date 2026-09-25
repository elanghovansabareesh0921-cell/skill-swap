/**
 * Client-side helper for Razorpay checkout integration
 */

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      return resolve(true);
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn("Failed to load Razorpay checkout script.");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface PaymentParams {
  amount: number; // in INR (e.g. 50, 100)
  credits: number; // e.g. 50, 100
  userName?: string;
  userEmail?: string;
  userId?: string;
  onSuccess: (creditsAdded: number, amountPaid: number, method: string, newBalance?: number) => void;
  onError: (errorMessage: string) => void;
  onProcessing?: (isProcessing: boolean) => void;
}

export async function processRazorpayCheckout({
  amount,
  credits,
  userName,
  userEmail,
  userId,
  onSuccess,
  onError,
  onProcessing,
}: PaymentParams) {
  try {
    if (onProcessing) onProcessing(true);

    // 1. Create order on the server
    const orderRes = await fetch("/api/payment/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        credits,
        userId,
        email: userEmail,
        name: userName,
      }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok || !orderData.success) {
      throw new Error(orderData.error || "Failed to create payment order.");
    }


    // 3. Live / Official Razorpay Checkout Flow
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded || !(window as any).Razorpay) {
      throw new Error("Razorpay checkout failed to load. Please check your network connection.");
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount, // in paise
      currency: orderData.currency || "INR",
      name: "Skill Swap",
      description: `Purchase of ${credits} Swap Credits (1 Credit = ₹1)`,
      image: "/favicon.ico",
      order_id: orderData.orderId,
      prefill: {
        name: userName || "Skill Swap Learner",
        email: userEmail || "",
      },
      theme: {
        color: "#7C3AED", // Skill Swap brand violet
      },
      modal: {
        ondismiss: function () {
          if (onProcessing) onProcessing(false);
        },
      },
      handler: async function (response: any) {
        try {
          const verifyRes = await fetch("/api/payment/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount,
              credits,
              userId,
              userEmail,
              userName,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            onSuccess(credits, amount, "Razorpay (Live)", verifyData.newBalance);
          } else {
            onError(verifyData.error || "Payment signature verification failed.");
          }
        } catch (err: any) {
          onError(err.message || "Error verifying payment with server.");
        } finally {
          if (onProcessing) onProcessing(false);
        }
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      onError(response.error?.description || "Payment was declined or cancelled.");
      if (onProcessing) onProcessing(false);
    });

    rzp.open();
  } catch (error: any) {
    if (onProcessing) onProcessing(false);
    onError(error.message || "An unexpected error occurred during checkout.");
  }
}
