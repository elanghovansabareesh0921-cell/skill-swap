import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    if (user instanceof NextResponse) return user;

    const { sessionId, reason } = await req.json();

    if (!sessionId || typeof reason !== 'string' || !reason.trim()) {
      return NextResponse.json(
        { error: 'Missing required dispute fields: sessionId and reason' },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // 1. Fetch current session
    const { data: session, error: sessionFetchError } = await admin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionFetchError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Authorization: verify user is teacher or learner
    const isTeacher = session.teacher_id === user.id;
    const isLearner = session.learner_id === user.id;

    if (!isTeacher && !isLearner) {
      return NextResponse.json(
        { error: 'Unauthorized to dispute this session' },
        { status: 403 }
      );
    }

    if (session.status === 'SETTLED' || session.status === 'CANCELLED') {
      return NextResponse.json(
        { error: `Cannot dispute a session that is already ${session.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // 3. Update session to DISPUTED with reason
    const { data: updatedSession, error: updateError } = await admin
      .from('sessions')
      .update({
        status: 'DISPUTED',
        dispute_reason: reason.trim(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update session dispute status:', updateError);
      return NextResponse.json(
        { error: 'Failed to record dispute status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dispute successfully filed and frozen in escrow for admin arbitration',
      session: updatedSession,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to file dispute';
    console.error('Dispute API error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
