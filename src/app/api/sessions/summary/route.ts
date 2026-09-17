import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch session details and participants
    const { data: session, error: sessionErr } = await supabase
      .from("sessions")
      .select("id, skill_name, requester:profiles!requester_id(full_name), receiver:profiles!receiver_id(full_name)")
      .eq("id", sessionId)
      .single();

    if (sessionErr || !session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
Generate a concise 2-sentence skill exchange summary and one suggested next topic for future learning.
Skill Taught: ${session.skill_name}
Teacher/Receiver: ${(session.receiver as any)?.full_name || "Peer"}
Learner/Requester: ${(session.requester as any)?.full_name || "Member"}

Format: Return just the 2-3 sentence paragraph.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const summary = response.text?.trim() || "Session completed successfully.";

    // Save summary back to the session record
    await supabase
      .from("sessions")
      .update({ ai_summary: summary })
      .eq("id", sessionId);

    return NextResponse.json({ success: true, summary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
