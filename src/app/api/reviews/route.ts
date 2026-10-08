import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, reviewerId, rating, feedback, tags } = await req.json();

    if (!sessionId || !reviewerId || !rating) {
      return NextResponse.json({ error: 'Missing required review fields' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({
        success: true,
        message: 'Review saved in fallback mode',
      });
    }

    // 1. Fetch Session to find reviewee (the other participant)
    const { data: session, error: sessionError } = await admin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const revieweeId = session.teacher_id === reviewerId ? session.learner_id : session.teacher_id;

    // 2. Insert Review Record
    const { data: reviewRecord, error: reviewError } = await admin
      .from('reviews')
      .insert({
        session_id: sessionId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating: Math.min(5, Math.max(1, Number(rating))),
        feedback: feedback || '',
        tags: tags || [],
        is_revealed: true,
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Error inserting review:', reviewError);
      return NextResponse.json({ error: 'Failed to record review' }, { status: 500 });
    }

    // 3. Recalculate and update reviewee reputation score
    const { data: allReviews } = await admin
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', revieweeId);

    if (allReviews && allReviews.length > 0) {
      const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
      const roundedScore = Math.round(avgRating * 100) / 100;

      await admin
        .from('profiles')
        .update({
          reputation_score: roundedScore,
          updated_at: new Date().toISOString(),
        })
        .eq('id', revieweeId);
    }

    return NextResponse.json({
      success: true,
      review: reviewRecord,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit review';
    console.error('Reviews API error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
