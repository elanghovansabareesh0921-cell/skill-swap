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
Create a practical, 45-minute peer-learning session agenda for the topic: "${session.skill_name}".
Mentor/Host: ${(session.receiver as any)?.full_name || "Teacher"}
Learner: ${(session.requester as any)?.full_name || "Learner"}

Return a bulleted list with exactly 3 timed sections (e.g. 0-10m, 10-35m, 35-45m) covering:
1. Core fundamentals & goal alignment
2. Hands-on demonstration or code review
3. Q&A and next practice steps

Keep it concise and ready to execute.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const agenda = response.text?.trim() || "No agenda generated.";

    return NextResponse.json({ success: true, agenda });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}