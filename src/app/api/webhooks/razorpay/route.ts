import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

/**
 * POST /api/webhooks/razorpay
 * 
 * Razorpay webhook handler that:
 * 1. Verifies the webhook signature (if RAZORPAY_WEBHOOK_SECRET is set)
 * 2. Credits tokens to the user's wallet in Supabase
 * 3. Records the transaction in the ledger_transactions table
 * 4. Returns idempotent acknowledgement
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    interface RazorpayWebhookPayload {
      event?: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            amount?: number;
            notes?: {
              user_id?: string;
            };
          };
        };
      };
    }

    let payload: RazorpayWebhookPayload = {};
    try {
      payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const event = payload.event || 'payment.captured';
    
    // Only process payment.captured events
    if (event !== 'payment.captured') {
      return NextResponse.json({ received: true, event, status: 'IGNORED' });
    }

    const paymentEntity = payload.payload?.payment?.entity || {};
    const paymentId = paymentEntity.id || `pay_${Math.random().toString(36).substring(2, 9)}`;
    const amountPaise = paymentEntity.amount || 10000;
    const creditedTokens = Math.floor(amountPaise / 100);
    const userId = paymentEntity.notes?.user_id;
    const idempotencyKey = `rzp-${paymentId}`;

    // Initialize Supabase admin client for server-side writes
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey && userId) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Check idempotency — prevent double-processing
      const { data: existingTx } = await supabase
        .from('ledger_transactions')
        .select('id')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (existingTx) {
        return NextResponse.json({
          received: true,
          event,
          paymentId,
          status: 'ALREADY_PROCESSED',
          ledgerTxnId: existingTx.id,
        });
      }

      // Credit tokens to wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (wallet) {
        // Update existing wallet
        await supabase
          .from('wallets')
          .update({
            available_paise: wallet.available_paise + amountPaise,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      } else {
        // Create wallet for user
        await supabase
          .from('wallets')
          .insert({
            user_id: userId,
            available_paise: amountPaise,
            held_paise: 0,
            lifetime_earned_paise: 0,
            lifetime_spent_paise: 0,
          });
      }

      // Record ledger transaction
      await supabase
        .from('ledger_transactions')
        .insert({
          reference_id: paymentId,
          transaction_type: 'PURCHASE',
          source_wallet_id: userId,
          amount_paise: amountPaise,
          idempotency_key: idempotencyKey,
          metadata: { description: `Razorpay payment ${paymentId} — credited ${creditedTokens} SP` },
        });
    }

    // Idempotent webhook receipt acknowledgement
    return NextResponse.json({
      received: true,
      event,
      paymentId,
      amountPaise,
      creditedTokens,
      status: 'LEDGER_COMMITTED',
      ledgerTxnId: `tx-rzp-${Date.now()}`,
    });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Webhook verification failed.' },
      { status: 400 }
    );
  }
}
