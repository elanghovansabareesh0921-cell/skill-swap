import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_fallback',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'fallback_secret',
});

export async function POST(request: Request) {
  try {
    const { amountTokens, userId } = await request.json();

    if (!amountTokens || typeof amountTokens !== 'number' || amountTokens < 50 || amountTokens > 10000) {
      return NextResponse.json(
        { error: 'Token purchase amount must be between 50 and 10,000 Tokens (₹50 to ₹10,000).' },
        { status: 400 }
      );
    }

    const amountPaise = amountTokens * 100;

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      receipt: order.receipt,
      amountTokens,
      amountPaise: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_fallback',
      message: 'Razorpay order created. Proceed with checkout.'
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create payment order.' },
      { status: 500 }
    );
  }
}
