import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, credits, userId, email, name } = body;

    if (!amount || amount <= 0 || !credits || credits <= 0) {
      return NextResponse.json(
        { error: "Invalid amount or credit parameters." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    // If live/test Razorpay API credentials are provided in .env.local
    if (keyId && keySecret) {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${Date.now()}_${credits}`,
        notes: {
          credits: String(credits),
          userId: userId || "guest",
          userEmail: email || "",
          userName: name || "",
        },
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: keyId,
        isTestMode: false,
      });
    }

    // Sandbox / Development Simulator Mode (when API keys have not yet been placed in .env.local)
    return NextResponse.json({
      success: true,
      orderId: `order_sim_${Date.now()}`,
      amount: amountInPaise,
      currency: "INR",
      keyId: keyId || "rzp_test_placeholder",
      isTestMode: true,
      message:
        "Razorpay keys not yet detected in .env.local. Running in demo simulation mode.",
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate Razorpay order." },
      { status: 500 }
    );
  }
}
