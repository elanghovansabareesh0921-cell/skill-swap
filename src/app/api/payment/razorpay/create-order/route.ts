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

    if (amountInPaise < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise (1 INR)." },
        { status: 400 }
      );
    }

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured. Please restart the dev server so they are loaded from .env.local" },
        { status: 500 }
      );
    }

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
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    
    // Handle auth failures (return 401)
    if (error?.statusCode === 401 || (error?.error?.code === 'BAD_REQUEST_ERROR' && error?.error?.description?.includes('authenticat'))) {
      return NextResponse.json(
        { error: "Authentication failed with payment provider." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to initiate Razorpay order." },
      { status: 500 }
    );
  }
}
