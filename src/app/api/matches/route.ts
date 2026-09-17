import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

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

    // 1. Fetch current user's skills
    const { data: mySkills } = await supabase
      .from("user_skills")
      .select("skill_type, level, goal, skills(id, name)")
      .eq("user_id", userId);

    if (!mySkills || mySkills.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    const myTeaches = mySkills.filter((s: any) => s.skill_type === "TEACH");
    const myLearns = mySkills.filter((s: any) => s.skill_type === "LEARN");

    // 2. Fetch other users' skills
    const { data: others } = await supabase
      .from("user_skills")
      .select("user_id, skill_type, level, goal, skills(id, name), profiles(full_name)")
      .neq("user_id", userId);

    if (!others || others.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // 3. Phase 7: Non-AI reciprocal candidate filtering
    // Group candidate data by user_id
    const candidatesMap = new Map<string, any>();
    for (const record of others) {
      const id = record.user_id;
      if (!candidatesMap.has(id)) {
        candidatesMap.set(id, {
          userId: id,
          name: (record.profiles as any)?.full_name || "Peer Member",
          teaches: [],
          learns: [],
        });
      }
      const candidate = candidatesMap.get(id);
      if (record.skill_type === "TEACH") {
        candidate.teaches.push({ skill: (record.skills as any)?.name, level: record.level });
      } else {
        candidate.learns.push({ skill: (record.skills as any)?.name, level: record.level, goal: record.goal });
      }
    }

    const candidates = Array.from(candidatesMap.values());

    // 4. Phase 8: Google Gemini AI Scoring and Reasoning
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are the matching engine for SkillSwap.
Current User Profile:
- Teaches: ${JSON.stringify(myTeaches.map((s: any) => ({ skill: s.skills?.name, level: s.level })))}
- Wants to learn: ${JSON.stringify(myLearns.map((s: any) => ({ skill: s.skills?.name, level: s.level, goal: s.goal })))}

Potential Match Candidates:
${JSON.stringify(candidates)}

Evaluate compatibility for each candidate based on skill reciprocity and goals. Return structured JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  userId: { type: Type.STRING },
                  name: { type: Type.STRING },
                  compatibilityScore: { type: Type.INTEGER },
                  matchReason: { type: Type.STRING },
                  teaches: { type: Type.STRING },
                  wants: { type: Type.STRING },
                },
                required: ["userId", "name", "compatibilityScore", "matchReason", "teaches", "wants"],
              },
            },
          },
          required: ["matches"],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"matches": []}');
    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}