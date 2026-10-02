import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amountTokens, userId } = await request.json();

    if (!amountTokens || typeof amountTokens !== 'number' || amountTokens < 50 || amountTokens > 10000) {
      return NextResponse.json(
        { error: 'Token purchase amount must be between 50 and 10,000 Tokens (₹50 to ₹10,000).' },
        { status: 400 }
      );
    }

    const orderId = `order_${Math.random().toString(36).substring(2, 10)}`;
    const receipt = `rcpt_${Date.now()}`;
    const amountPaise = amountTokens * 100;

    return NextResponse.json({
      orderId,
      receipt,
      amountTokens,
      amountPaise,
      currency: 'INR',
      keyId: 'rzp_test_skillswap_sandbox',
      message: 'Razorpay order created. Proceed with checkout.'
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create payment order.' },
      { status: 500 }
    );
  }
}
