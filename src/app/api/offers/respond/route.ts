import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    if (user instanceof NextResponse) return user;

    const { offerId, action, reason } = await req.json();

    if (!offerId || !action) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    const { data: offer, error: offerError } = await admin
      .from('offers')
      .select('*')
      .eq('id', offerId)
      .single();

    if (offerError || !offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    const isProposer = offer.proposer_id === user.id;
    const isRecipient = offer.recipient_id === user.id;

    if (!isProposer && !isRecipient) {
      return NextResponse.json({ error: 'Unauthorized to respond to this offer' }, { status: 403 });
    }

    const chargedTokens = offer.quote_snapshot?.proposerLeg?.chargedTokens || 0;
    const holdPaise = Math.round(chargedTokens * 100);

    if (action === 'DECLINE' || action === 'WITHDRAW') {
      // 1. Release held tokens back to proposer Available balance
      const { data: proposerWallet } = await admin
        .from('wallets')
        .select('*')
        .eq('user_id', offer.proposer_id)
        .single();

      if (proposerWallet) {
        await admin
          .from('wallets')
          .update({
            held_paise: Math.max(0, proposerWallet.held_paise - holdPaise),
            available_paise: proposerWallet.available_paise + holdPaise,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', offer.proposer_id);
      }

      // 2. Record REFUND in ledger
      await admin.from('ledger_transactions').insert({
        reference_id: offer.id,
        transaction_type: 'REFUND',
        source_wallet_id: offer.proposer_id,
        dest_wallet_id: offer.proposer_id,
        amount_paise: holdPaise,
        idempotency_key: `idemp-offer-${action.toLowerCase()}-${offer.id}`,
        metadata: {
          action,
          reason: reason || (action === 'DECLINE' ? 'Declined by recipient' : 'Withdrawn by proposer'),
        },
      });

      // 3. Update offer status
      const newStatus = action === 'DECLINE' ? 'DECLINED' : 'CANCELLED';
      const { data: updatedOffer } = await admin
        .from('offers')
        .update({ status: newStatus })
        .eq('id', offer.id)
        .select()
        .single();

      return NextResponse.json({
        success: true,
        action,
        offer: updatedOffer,
      });
    }

    return NextResponse.json({ error: 'Invalid offer action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process offer response';
    console.error('Offer response error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
