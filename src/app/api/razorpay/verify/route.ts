import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const cleanEnv = (val?: string) => val ? val.replace(/['"]/g, '').trim() : undefined;

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amountTokens } = await request.json();
    const key_secret = cleanEnv(process.env.RAZORPAY_KEY_SECRET);

    if (
      typeof razorpay_order_id !== 'string' ||
      typeof razorpay_payment_id !== 'string' ||
      typeof razorpay_signature !== 'string' ||
      typeof amountTokens !== 'number' ||
      !Number.isFinite(amountTokens) ||
      amountTokens < 50 ||
      amountTokens > 10000
    ) {
      return NextResponse.json({ error: 'Invalid payment verification payload' }, { status: 400 });
    }

    if (!key_secret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Implement HMAC-SHA256 signature verification
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');
    
    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const keyId = cleanEnv(process.env.RAZORPAY_KEY_ID) || cleanEnv(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
    if (!keyId) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    const razorpay = new Razorpay({ key_id: keyId, key_secret });
    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (
      Number(order.amount) !== Math.round(amountTokens * 100) ||
      order.notes?.user_id !== user.id
    ) {
      return NextResponse.json({ error: 'Payment order does not match the authenticated user or amount' }, { status: 400 });
    }

    // Signature is valid. Credit wallet in Supabase idempotently
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const idempotencyKey = `rzp-${razorpay_payment_id}`;

    if (supabaseUrl && supabaseServiceKey && amountTokens) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const amountPaise = Math.round(Number(amountTokens) * 100);

      // Check if already credited by webhook or prior request
      const { data: existingTx } = await supabase
        .from('ledger_transactions')
        .select('id')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (!existingTx) {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (wallet) {
          await supabase
            .from('wallets')
            .update({
              available_paise: wallet.available_paise + amountPaise,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('wallets')
            .insert({
              user_id: user.id,
              available_paise: amountPaise,
              held_paise: 0,
              lifetime_earned_paise: 0,
              lifetime_spent_paise: 0,
            });
        }

        await supabase
          .from('ledger_transactions')
          .insert({
            reference_id: razorpay_payment_id,
            transaction_type: 'PURCHASE',
            source_wallet_id: user.id,
            amount_paise: amountPaise,
            idempotency_key: idempotencyKey,
            metadata: { description: `Razorpay Verified Purchase (${amountTokens} SP)` },
          });
      }
    }

    return NextResponse.json({ success: true, message: 'Payment verified and wallet credited' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 500 });
  }
}
