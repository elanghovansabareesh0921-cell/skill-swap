import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: messages, error } = await supabase
      .from("messages")
      .select("id, content, created_at, sender_id, sender:profiles!sender_id(full_name)")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ messages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { sessionId, senderId, content } = await req.json();

    if (!sessionId || !senderId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("messages")
      .insert({ session_id: sessionId, sender_id: senderId, content })
      .select("id, content, created_at, sender_id, sender:profiles!sender_id(full_name)")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
