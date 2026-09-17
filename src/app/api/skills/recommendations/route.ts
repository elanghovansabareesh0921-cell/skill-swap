import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: userSkills, error } = await supabase
      .from("user_skills")
      .select("skill_type, level, skills(name, category)")
      .eq("user_id", userId);

    if (error) throw error;

    const teaching = (userSkills || [])
      .filter((s: any) => s.skill_type === "TEACH")
      .map((s: any) => `${s.skills?.name} (${s.level})`);

    const learning = (userSkills || [])
      .filter((s: any) => s.skill_type === "LEARN")
      .map((s: any) => `${s.skills?.name} (${s.level})`);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are a technical career advisor and peer-learning curriculum designer.
Analyze this user's profile:
- Skills they can teach: ${teaching.length > 0 ? teaching.join(", ") : "None specified yet"}
- Skills they want to learn: ${learning.length > 0 ? learning.join(", ") : "None specified yet"}

Recommend exactly 3 high-value, complementary skills or technologies they should consider adding to their learning roadmap to maximize reciprocal swap potential and career growth.

Format strictly as valid JSON with no markdown wraps or extra commentary:
[
  {
    "skillName": "Name of Skill",
    "category": "Category",
    "rationale": "One concise sentence why this pairs with their current stack.",
    "milestone": "A concrete 1-session project or practice goal"
  }
]
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = response.text?.trim().replace(/```json|```/g, "") || "[]";
    const recommendations = JSON.parse(rawText);

    return NextResponse.json({ success: true, recommendations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}