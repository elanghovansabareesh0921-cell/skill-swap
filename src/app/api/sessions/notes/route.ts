import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { sessionId, scratchpadContent } = await req.json();

    if (!sessionId || !scratchpadContent || scratchpadContent.trim().length < 10) {
      return NextResponse.json({ success: true, message: "No significant notes to synthesize." });
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
Synthesize the following live notes and code snippets taken during a peer-to-peer learning session.
Raw Notes / Snippets:
"""
${scratchpadContent}
"""

Provide a concise summary formatted as:
- Key Takeaways (2-3 concise bullets)
- Practice Exercise / Next Action (1 clear prompt)
Keep the response under 120 words.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const aiRecap = response.text?.trim() || "";

    if (aiRecap) {
      await supabase
        .from("sessions")
        .update({ ai_summary: aiRecap })
        .eq("id", sessionId);
    }

    return NextResponse.json({ success: true, recap: aiRecap });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}