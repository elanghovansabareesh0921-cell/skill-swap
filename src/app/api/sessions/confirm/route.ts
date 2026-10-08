import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    if (user instanceof NextResponse) return user;

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // 1. Fetch current session state
    const { data: session, error: sessionFetchError } = await admin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionFetchError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const isTeacher = session.teacher_id === user.id;
    const isLearner = session.learner_id === user.id;

    if (!isTeacher && !isLearner) {
      return NextResponse.json({ error: 'Unauthorized to confirm this session' }, { status: 403 });
    }

    const updatedTeacherConfirmed = isTeacher ? true : (session.teacher_confirmed || false);
    const updatedLearnerConfirmed = isLearner ? true : (session.learner_confirmed || false);
    const bothConfirmed = updatedTeacherConfirmed && updatedLearnerConfirmed;

    // 2. If both have not confirmed yet, just update the single participant confirmation
    if (!bothConfirmed) {
      const { data: updatedSession, error: updateError } = await admin
        .from('sessions')
        .update({
          teacher_confirmed: updatedTeacherConfirmed,
          learner_confirmed: updatedLearnerConfirmed,
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update session confirmation' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        settled: false,
        session: updatedSession,
      });
    }

    // 3. Both confirmed: execute atomic escrow release
    const chargedPaise = session.charged_tokens * 100;
    const payoutPaise = Math.round(Number(session.teacher_payout_tokens) * 100);
    const feePaise = Math.round(Number(session.platform_fee_tokens) * 100);

    // Update Learner Wallet (deduct from held_paise)
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
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', session.learner_id);
    }

    // Update Teacher Wallet (credit payout to available_paise)
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
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', session.teacher_id);
    }

    // Record RELEASE in ledger_transactions
    await admin.from('ledger_transactions').upsert({
      reference_id: session.id,
      transaction_type: 'RELEASE',
      source_wallet_id: session.learner_id,
      dest_wallet_id: session.teacher_id,
      amount_paise: payoutPaise,
      idempotency_key: `idemp-rel-${session.id}`,
      metadata: {
        sessionId: session.id,
        durationMinutes: session.duration_minutes,
        payoutTokens: session.teacher_payout_tokens,
      },
    }, { onConflict: 'idempotency_key' });

    // Record FEE in ledger_transactions
    await admin.from('ledger_transactions').upsert({
      reference_id: session.id,
      transaction_type: 'FEE',
      source_wallet_id: session.learner_id,
      amount_paise: feePaise,
      idempotency_key: `idemp-fee-${session.id}`,
      metadata: {
        sessionId: session.id,
        feeTokens: session.platform_fee_tokens,
      },
    }, { onConflict: 'idempotency_key' });

    // Update Session status to SETTLED
    const { data: settledSession, error: settleError } = await admin
      .from('sessions')
      .update({
        status: 'SETTLED',
        teacher_confirmed: true,
        learner_confirmed: true,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (settleError) {
      return NextResponse.json({ error: 'Failed to settle session status' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      settled: true,
      session: settledSession,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to confirm session';
    console.error('Session confirmation error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
