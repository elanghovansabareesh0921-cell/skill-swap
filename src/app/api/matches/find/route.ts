import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { GoogleGenAI } from "@google/genai";

export async function GET(request: Request) {
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

    // 1. Fetch current user's skills
    const { data: currentUserSkills } = await supabase
      .from("user_skills")
      .select("skill_id, skill_type, skills(name)")
      .eq("user_id", user.id);

    if (!currentUserSkills || currentUserSkills.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    const myLearnSkills = currentUserSkills.filter(s => s.skill_type === 'LEARN').map(s => (s.skills as any).name);
    const myTeachSkills = currentUserSkills.filter(s => s.skill_type === 'TEACH').map(s => (s.skills as any).name);

    if (myLearnSkills.length === 0 || myTeachSkills.length === 0) {
      // Need both to do a reciprocal match
      return NextResponse.json({ matches: [] });
    }

    // 2. Fetch potential matches (other users who have reciprocal skills)
    const { data: otherUserSkills } = await supabase
      .from("user_skills")
      .select("user_id, skill_id, skill_type, skills(name), profiles(full_name, bio)")
      .neq("user_id", user.id);

    if (!otherUserSkills) {
      return NextResponse.json({ matches: [] });
    }

    // Group by user
    const usersMap = new Map<string, any>();
    otherUserSkills.forEach(us => {
      const uid = us.user_id;
      if (!usersMap.has(uid)) {
        usersMap.set(uid, {
          user_id: uid,
          full_name: (us.profiles as any).full_name,
          bio: (us.profiles as any).bio,
          learn: [],
          teach: []
        });
      }
      const u = usersMap.get(uid);
      if (us.skill_type === 'LEARN') u.learn.push((us.skills as any).name);
      if (us.skill_type === 'TEACH') u.teach.push((us.skills as any).name);
    });

    // 3. Filter for reciprocal overlap
    const potentialMatches: any[] = [];
    for (const [uid, u] of usersMap.entries()) {
      const overlapTheyTeachMe = u.teach.filter((skill: string) => myLearnSkills.includes(skill));
      const overlapITeachThem = u.learn.filter((skill: string) => myTeachSkills.includes(skill));

      if (overlapTheyTeachMe.length > 0 && overlapITeachThem.length > 0) {
        potentialMatches.push({
          ...u,
          overlapTheyTeachMe,
          overlapITeachThem
        });
      }
    }

    if (potentialMatches.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // 4. Score matches with Gemini AI
    if (!process.env.GEMINI_API_KEY) {
      // Fallback if no API key
      const matches = potentialMatches.map(m => ({
        ...m,
        score: 75,
        rationale: "Good structural match based on overlapping skills."
      }));
      return NextResponse.json({ matches });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
    You are an AI Matchmaker for a Skill Swap platform. 
    User A (The Current User) wants to learn: ${myLearnSkills.join(", ")}
    User A wants to teach: ${myTeachSkills.join(", ")}

    Evaluate the following potential matches and assign a Compatibility Score (0-100) and a concise 1-sentence rationale for each match.
    Matches:
    ${potentialMatches.map((m, i) => `
      Match ${i + 1}:
      Name: ${m.full_name}
      Bio: ${m.bio}
      They can teach User A: ${m.overlapTheyTeachMe.join(", ")}
      They want to learn from User A: ${m.overlapITeachThem.join(", ")}
    `).join("\n")}

    Respond ONLY with a valid JSON array of objects. Format:
    [
      { "user_id": "extract the ID from your context, but just use index 0, 1, 2 here", "index": 0, "score": 95, "rationale": "95% Match: User A can master..." }
    ]
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let jsonStr = response.text || "[]";
      // clean markdown code blocks
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const aiResults = JSON.parse(jsonStr);

      const finalMatches = potentialMatches.map((m, i) => {
        const aiData = aiResults.find((r: any) => r.index === i);
        return {
          ...m,
          score: aiData?.score || 80,
          rationale: aiData?.rationale || "Great potential match based on shared interests."
        };
      }).sort((a, b) => b.score - a.score);

      return NextResponse.json({ matches: finalMatches });
    } catch (aiErr) {
      console.error("AI Match Error:", aiErr);
      // Fallback
      return NextResponse.json({ matches: potentialMatches.map(m => ({...m, score: 70, rationale: "Match found based on skills."}))});
    }
  } catch (error: any) {
    console.error("Matchmaking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
