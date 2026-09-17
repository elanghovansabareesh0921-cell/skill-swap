import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { requesterId, receiverId, skillName } = await req.json();

    if (!requesterId || !receiverId || !skillName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.rpc("book_session_with_escrow", {
      p_requester_id: requesterId,
      p_receiver_id: receiverId,
      p_skill_name: skillName,
    });

    if (error) throw error;
    if (data?.error) return NextResponse.json({ error: data.error }, { status: 400 });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}