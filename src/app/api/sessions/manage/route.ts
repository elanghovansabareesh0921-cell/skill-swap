import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("id, receiver_id, requester_id, skill_name, status, ai_summary, scheduled_at, duration_minutes, created_at, requester:profiles!requester_id(full_name), receiver:profiles!receiver_id(full_name)")
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ sessions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { sessionId, status, scheduledAt, actorId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (scheduledAt) {
      const { data, error } = await supabase
        .from("sessions")
        .update({ scheduled_at: scheduledAt })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, session: data });
    }

    if (status === "CANCELLED") {
      const { data: cancelResult, error: cancelError } = await supabase.rpc("cancel_session_and_refund", {
        p_session_id: sessionId,
        p_actor_id: actorId,
      });

      if (cancelError) throw cancelError;
      if (cancelResult?.error) return NextResponse.json({ error: cancelResult.error }, { status: 400 });

      return NextResponse.json({ success: true });
    }

    if (status === "COMPLETED") {
      const { data: payoutResult, error: rpcError } = await supabase.rpc("complete_session_payout", {
        p_session_id: sessionId,
      });

      if (rpcError) throw rpcError;
      if (payoutResult?.error) return NextResponse.json({ error: payoutResult.error }, { status: 400 });

      return NextResponse.json({ success: true });
    }

    const { data, error } = await supabase
      .from("sessions")
      .update({ status })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, session: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}