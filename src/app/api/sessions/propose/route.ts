import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, skillName, scheduledAt, durationMinutes } = body;

    if (!receiverId || !skillName || !scheduledAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Call the atomic RPC to book the session and hold escrow
    const { data, error } = await supabase.rpc("book_session_with_escrow", {
      p_requester_id: user.id,
      p_receiver_id: receiverId,
      p_skill_name: skillName,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data?.error) {
       return NextResponse.json({ error: data.error }, { status: 400 });
    }

    const sessionId = data?.session_id;

    if (sessionId) {
      // Update the scheduled time and duration
      await supabase
        .from("sessions")
        .update({
          scheduled_at: scheduledAt,
          duration_minutes: durationMinutes || 45,
        })
        .eq("id", sessionId);

      // Create a message in the chat room to represent this proposal
      await supabase
        .from("messages")
        .insert({
          session_id: sessionId,
          sender_id: user.id,
          content: `I proposed a session for ${skillName} at ${new Date(scheduledAt).toLocaleString()}.`
        });
    }

    return NextResponse.json({ success: true, sessionId });
  } catch (error: any) {
    console.error("Propose session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
