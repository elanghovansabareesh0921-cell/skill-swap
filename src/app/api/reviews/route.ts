import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    if (user instanceof NextResponse) return user;

    const { sessionId, rating, feedback, tags } = await req.json();

    if (!sessionId || !rating) {
      return NextResponse.json({ error: 'Missing required review fields' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // 1. Fetch Session to find reviewee (the other participant)
    const { data: session, error: sessionError } = await admin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.teacher_id !== user.id && session.learner_id !== user.id) {
      return NextResponse.json({ error: 'You are not a participant in this session' }, { status: 403 });
    }

    const revieweeId = session.teacher_id === user.id ? session.learner_id : session.teacher_id;

    // 2. Insert Review Record
    const { data: reviewRecord, error: reviewError } = await admin
      .from('reviews')
      .insert({
        session_id: sessionId,
        reviewer_id: user.id,
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

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const requestedLimit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(100, Math.max(1, requestedLimit)) : 50;

    const admin = getSupabaseAdmin();

    let query = admin
      .from('reviews')
      .select('*, reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (sessionId) {
      const { data: session } = await admin
        .from('sessions')
        .select('teacher_id, learner_id')
        .eq('id', sessionId)
        .maybeSingle();
      if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      if (session.teacher_id !== user.id && session.learner_id !== user.id) {
        return NextResponse.json({ error: 'You are not a participant in this session' }, { status: 403 });
      }
      query = query.eq('session_id', sessionId);
    } else {
      query = query.or(`reviewee_id.eq.${user.id},reviewer_id.eq.${user.id}`);
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ error: 'Failed to retrieve reviews' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reviews: reviews || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve reviews';
    console.error('Reviews GET error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
