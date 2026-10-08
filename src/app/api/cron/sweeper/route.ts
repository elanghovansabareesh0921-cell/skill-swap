import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ message: 'Sweeper ran in fallback mode (no Supabase connection)' });
    }

    const nowIso = new Date().toISOString();
    let expiredOffersCount = 0;
    let autoSettledSessionsCount = 0;

    // 1. Process Expired Pending Offers (48h timeout -> refund held tokens)
    const { data: expiredOffers } = await admin
      .from('offers')
      .select('*')
      .eq('status', 'PENDING')
      .lt('expires_at', nowIso);

    if (expiredOffers && expiredOffers.length > 0) {
      for (const offer of expiredOffers) {
        const chargedTokens = offer.quote_snapshot?.proposerLeg?.chargedTokens || 0;
        const holdPaise = Math.round(chargedTokens * 100);

        // Refund held tokens
        const { data: wallet } = await admin
          .from('wallets')
          .select('*')
          .eq('user_id', offer.proposer_id)
          .single();

        if (wallet) {
          await admin
            .from('wallets')
            .update({
              held_paise: Math.max(0, wallet.held_paise - holdPaise),
              available_paise: wallet.available_paise + holdPaise,
              updated_at: nowIso,
            })
            .eq('user_id', offer.proposer_id);
        }

        // Record REFUND in ledger
        await admin.from('ledger_transactions').insert({
          reference_id: offer.id,
          transaction_type: 'REFUND',
          source_wallet_id: offer.proposer_id,
          dest_wallet_id: offer.proposer_id,
          amount_paise: holdPaise,
          idempotency_key: `idemp-sweep-exp-${offer.id}`,
          metadata: { reason: '48h offer timeout auto-refund' },
        });

        // Mark EXPIRED
        await admin
          .from('offers')
          .update({ status: 'EXPIRED' })
          .eq('id', offer.id);

        expiredOffersCount++;
      }
    }

    // 2. Process Auto-Settle for Sessions with One Confirmation after 24 hours (PRD §6.3)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 3600000).toISOString();
    const { data: staleSessions } = await admin
      .from('sessions')
      .select('*')
      .eq('status', 'SCHEDULED')
      .lt('scheduled_end', twentyFourHoursAgo)
      .or('teacher_confirmed.eq.true,learner_confirmed.eq.true');

    if (staleSessions && staleSessions.length > 0) {
      for (const session of staleSessions) {
        // Only auto-settle if exactly one party confirmed and not disputed
        const isOneSideConfirmed = (session.teacher_confirmed || session.learner_confirmed) && !(session.teacher_confirmed && session.learner_confirmed);
        if (isOneSideConfirmed && !session.dispute_reason) {
          const chargedPaise = session.charged_tokens * 100;
          const payoutPaise = Math.round(Number(session.teacher_payout_tokens) * 100);
          const feePaise = Math.round(Number(session.platform_fee_tokens) * 100);

          // Update Learner Wallet
          const { data: learnerWallet } = await admin
            .from('wallets')
            .select('*')
            .eq('user_id', session.learner_id)
            .single();

          if (learnerWallet) {
            await admin
              .from('wallets')
              .update({
                held_paise: Math.max(0, learnerWallet.held_paise - chargedPaise),
                lifetime_spent_paise: (learnerWallet.lifetime_spent_paise || 0) + chargedPaise,
                updated_at: nowIso,
              })
              .eq('user_id', session.learner_id);
          }

          // Update Teacher Wallet
          const { data: teacherWallet } = await admin
            .from('wallets')
            .select('*')
            .eq('user_id', session.teacher_id)
            .single();

          if (teacherWallet) {
            await admin
              .from('wallets')
              .update({
                available_paise: teacherWallet.available_paise + payoutPaise,
                lifetime_earned_paise: (teacherWallet.lifetime_earned_paise || 0) + payoutPaise,
                updated_at: nowIso,
              })
              .eq('user_id', session.teacher_id);
          }

          // Ledger RELEASE and FEE
          await admin.from('ledger_transactions').insert({
            reference_id: session.id,
            transaction_type: 'RELEASE',
            source_wallet_id: session.learner_id,
            dest_wallet_id: session.teacher_id,
            amount_paise: payoutPaise,
            idempotency_key: `idemp-sweep-rel-${session.id}`,
            metadata: { reason: '24h single-confirmation auto-settle' },
          });

          await admin.from('ledger_transactions').insert({
            reference_id: session.id,
            transaction_type: 'FEE',
            source_wallet_id: session.learner_id,
            amount_paise: feePaise,
            idempotency_key: `idemp-sweep-fee-${session.id}`,
            metadata: { reason: 'Platform fee on auto-settled session' },
          });

          // Mark SETTLED
          await admin
            .from('sessions')
            .update({
              status: 'SETTLED',
              teacher_confirmed: true,
              learner_confirmed: true,
            })
            .eq('id', session.id);

          autoSettledSessionsCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: nowIso,
      expiredOffersCount,
      autoSettledSessionsCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sweeper job failed';
    console.error('Sweeper error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
