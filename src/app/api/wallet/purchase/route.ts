import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';

const cleanEnv = (val?: string) => val ? val.replace(/['"]/g, '').trim() : undefined;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const key_id = cleanEnv(process.env.RAZORPAY_KEY_ID) || cleanEnv(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
    const key_secret = cleanEnv(process.env.RAZORPAY_KEY_SECRET);

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: 'Razorpay keys are not properly configured on the server.' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });
    
    const { amountTokens } = await request.json();

    if (!amountTokens || typeof amountTokens !== 'number' || amountTokens < 50 || amountTokens > 10000) {
      return NextResponse.json(
        { error: 'Token purchase amount must be between 50 and 10,000 Tokens (₹50 to ₹10,000).' },
        { status: 400 }
      );
    }

    const amountPaise = Math.round(amountTokens * 100);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { user_id: user.id, amount_tokens: String(amountTokens) },
    });

    return NextResponse.json({
      orderId: order.id,
      receipt: order.receipt,
      amountTokens,
      amountPaise: order.amount,
      currency: order.currency,
      keyId: key_id,
      message: 'Razorpay order created. Proceed with checkout.'
    });
  } catch (error: unknown) {
    console.error('Razorpay Order Error:', error);
    const errObj = error as { error?: { description?: string }; message?: string } | undefined;
    const errorMessage = errObj?.error?.description || errObj?.message || 'Failed to create payment order.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
