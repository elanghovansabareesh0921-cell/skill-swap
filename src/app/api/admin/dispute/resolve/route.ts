import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const adminUser = await requireAdmin(req);
    if (adminUser instanceof NextResponse) return adminUser;

    const body = await req.json();
    const { sessionId, resolution, reason } = body;

    if (!sessionId || !resolution) {
      return NextResponse.json({ error: 'Missing sessionId or resolution' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    const { data: session, error: sessionError } = await admin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const chargedPaise = session.charged_tokens * 100;
    const teacherPayoutPaise = Math.round(Number(session.teacher_payout_tokens) * 100);
    const platformFeePaise = Math.round(Number(session.platform_fee_tokens) * 100);

    // Fetch Learner and Teacher Wallets
    const { data: learnerWallet } = await admin
      .from('wallets')
      .select('*')
      .eq('user_id', session.learner_id)
      .single();

    const { data: teacherWallet } = await admin
      .from('wallets')
      .select('*')
      .eq('user_id', session.teacher_id)
      .single();

    if (resolution === 'REFUND') {
      // 100% refund held funds back to learner available balance
      if (learnerWallet) {
        await admin
          .from('wallets')
          .update({
            held_paise: Math.max(0, learnerWallet.held_paise - chargedPaise),
            available_paise: learnerWallet.available_paise + chargedPaise,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', session.learner_id);
      }

      await admin.from('ledger_transactions').insert({
        reference_id: session.id,
        transaction_type: 'REFUND',
        source_wallet_id: session.learner_id,
        dest_wallet_id: session.learner_id,
        amount_paise: chargedPaise,
        idempotency_key: `idemp-disp-ref-${session.id}`,
        metadata: {
          adjudicatedBy: adminUser.id,
          reason: reason || 'Admin dispute refund to learner',
        },
      });
    } else if (resolution === 'RELEASE') {
      // Release payout to teacher and deduct held funds from learner
      if (learnerWallet) {
        await admin
          .from('wallets')
          .update({
            held_paise: Math.max(0, learnerWallet.held_paise - chargedPaise),
            lifetime_spent_paise: (learnerWallet.lifetime_spent_paise || 0) + chargedPaise,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', session.learner_id);
      }

      if (teacherWallet) {
        await admin
          .from('wallets')
          .update({
            available_paise: teacherWallet.available_paise + teacherPayoutPaise,
            lifetime_earned_paise: (teacherWallet.lifetime_earned_paise || 0) + teacherPayoutPaise,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', session.teacher_id);
      }

      await admin.from('ledger_transactions').insert({
        reference_id: session.id,
        transaction_type: 'RELEASE',
        source_wallet_id: session.learner_id,
        dest_wallet_id: session.teacher_id,
        amount_paise: teacherPayoutPaise,
        idempotency_key: `idemp-disp-rel-${session.id}`,
        metadata: {
          adjudicatedBy: adminUser.id,
          reason: reason || 'Admin dispute release to teacher',
        },
      });

      await admin.from('ledger_transactions').insert({
        reference_id: session.id,
        transaction_type: 'FEE',
        source_wallet_id: session.learner_id,
        amount_paise: platformFeePaise,
        idempotency_key: `idemp-disp-fee-${session.id}`,
        metadata: {
          adjudicatedBy: adminUser.id,
          feeTokens: session.platform_fee_tokens,
        },
      });
    } else {
      // 50/50 SPLIT
      const halfPaise = Math.round(chargedPaise / 2);
      const halfTeacherPayout = Math.round(teacherPayoutPaise / 2);

      if (learnerWallet) {
        await admin
          .from('wallets')
          .update({
            held_paise: Math.max(0, learnerWallet.held_paise - chargedPaise),
            available_paise: learnerWallet.available_paise + halfPaise,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', session.learner_id);
      }

      if (teacherWallet) {
        await admin
          .from('wallets')
          .update({
            available_paise: teacherWallet.available_paise + halfTeacherPayout,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', session.teacher_id);
      }

      await admin.from('ledger_transactions').insert({
        reference_id: session.id,
        transaction_type: 'REFUND',
        source_wallet_id: session.learner_id,
        dest_wallet_id: session.learner_id,
        amount_paise: halfPaise,
        idempotency_key: `idemp-disp-split-learn-${session.id}`,
        metadata: {
          adjudicatedBy: adminUser.id,
          split: '50% to learner',
        },
      });

      await admin.from('ledger_transactions').insert({
        reference_id: session.id,
        transaction_type: 'RELEASE',
        source_wallet_id: session.learner_id,
        dest_wallet_id: session.teacher_id,
        amount_paise: halfTeacherPayout,
        idempotency_key: `idemp-disp-split-teach-${session.id}`,
        metadata: {
          adjudicatedBy: adminUser.id,
          split: '50% to teacher',
        },
      });
    }

    // Mark session as SETTLED
    const { data: updatedSession, error: updateError } = await admin
      .from('sessions')
      .update({
        status: 'SETTLED',
        dispute_reason: `Resolved (${resolution}) by Admin: ${reason || 'Adjudicated'}`,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update session status' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      resolution,
      session: updatedSession,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Dispute adjudication failed';
    console.error('Dispute adjudication error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
