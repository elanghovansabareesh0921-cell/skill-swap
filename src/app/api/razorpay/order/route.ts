import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Helper to strip accidental quotes and trailing whitespace
const cleanEnv = (val?: string) => val ? val.replace(/['"]/g, '').trim() : undefined;

export async function POST(request: Request) {
  try {
    // Fallback to NEXT_PUBLIC key if RAZORPAY_KEY_ID is missing
    const key_id = cleanEnv(process.env.RAZORPAY_KEY_ID) || cleanEnv(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
    const key_secret = cleanEnv(process.env.RAZORPAY_KEY_SECRET);

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: 'Razorpay keys are not properly configured on the server.' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    const body = await request.json();
    // Support both amountTokens (from WalletModal) and generic amount if used elsewhere
    const amountTokens = body.amountTokens; 

    if (!amountTokens || isNaN(amountTokens) || amountTokens <= 0) {
      return NextResponse.json({ error: 'Invalid amount provided.' }, { status: 400 });
    }

    // Razorpay requires amount in subunits (paise) as an integer
    const amountPaise = Math.round(amountTokens * 100);

    const options = {
      amount: amountPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amountTokens,
      amountPaise: order.amount,
      currency: order.currency,
      keyId: key_id,
      message: 'Razorpay order created. Proceed with checkout.'
    });
  } catch (error: unknown) {
    console.error('Razorpay Order Error:', error);
    // Safely extract Razorpay's specific error description if available
    const errObj = error as { error?: { description?: string }; message?: string } | undefined;
    const errorMessage = errObj?.error?.description || errObj?.message || 'Failed to create payment order.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
