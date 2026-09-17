import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { sessionId, transcript } = await req.json();

    if (!sessionId || !transcript || transcript.trim().length < 15) {
      return NextResponse.json({ success: true, message: "Transcript too brief to process." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured." }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are an expert technical note-taker. Below is the raw live speech transcript from a peer-to-peer technical session.
Transcript:
"""
${transcript}
"""

Please produce a structured summary formatted as:
- Key Concepts Explained (2-3 concise bullets)
- Debugging/Code Insights Mentioned (1-2 bullets)
- Actionable Practice Checklist (2 short tasks)

Keep the total word count under 150 words.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const aiSummary = response.text?.trim() || "";

    if (aiSummary) {
      await supabase
        .from("sessions")
        .update({ ai_summary: aiSummary })
        .eq("id", sessionId);
    }

    return NextResponse.json({ success: true, summary: aiSummary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}