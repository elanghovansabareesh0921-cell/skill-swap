import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { sessionId, reviewerId, revieweeId, rating, comment } = await req.json();

    if (!sessionId || !reviewerId || !revieweeId || !rating) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        session_id: sessionId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        comment,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, review: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
