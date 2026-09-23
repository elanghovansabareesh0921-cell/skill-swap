import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  calculateCompatibilityMatches,
  CurrentUserContext,
  CandidateUser,
  DEFAULT_CANDIDATE_POOL,
  MatchResult,
} from "@/lib/ai/compatibility";

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const { userId } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let currentUserContext: CurrentUserContext = {
      userId: userId || "current-user",
      fullName: "Alex Rivera",
      bio: "Fullstack developer passionate about building modern web products and learning machine learning pipelines.",
      teaches: [
        { skillName: "React & Next.js", proficiency: "advanced", yearsExperience: 4 },
        { skillName: "Tailwind CSS & UI Systems", proficiency: "advanced", yearsExperience: 4 },
      ],
      learns: [
        { skillName: "Python & Machine Learning", proficiencyTarget: "advanced", learningGoal: "Ship LLM-powered applications" },
        { skillName: "UI/UX Design Systems in Figma", proficiencyTarget: "intermediate" },
      ],
      availability: ["Weekday Evenings", "Weekend Flexible"],
      learningStyle: "hands-on",
    };

    let candidatePool: CandidateUser[] = [...DEFAULT_CANDIDATE_POOL];

    if (supabaseUrl && supabaseKey && userId) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch user profile
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("full_name, bio, role_preference")
          .eq("id", userId)
          .maybeSingle();

        if (userProfile?.full_name) {
          currentUserContext.fullName = userProfile.full_name;
          currentUserContext.bio = userProfile.bio || currentUserContext.bio;
        }

        // Fetch user's registered skills
        const { data: mySkills } = await supabase
          .from("user_skills")
          .select("skill_name, skill_type, proficiency_level, learning_goal, years_experience")
          .eq("user_id", userId);

        if (mySkills && mySkills.length > 0) {
          const teaches = mySkills
            .filter((s: any) => s.skill_type?.toLowerCase() === "teach")
            .map((s: any) => ({
              skillName: s.skill_name,
              proficiency: (s.proficiency_level?.toLowerCase() || "intermediate") as any,
              yearsExperience: s.years_experience || 3,
            }));

          const learns = mySkills
            .filter((s: any) => s.skill_type?.toLowerCase() === "learn")
            .map((s: any) => ({
              skillName: s.skill_name,
              proficiencyTarget: (s.proficiency_level?.toLowerCase() || "intermediate") as any,
              learningGoal: s.learning_goal,
            }));

          if (teaches.length > 0) currentUserContext.teaches = teaches;
          if (learns.length > 0) currentUserContext.learns = learns;
        }

        // Fetch other users
        const { data: otherSkills } = await supabase
          .from("user_skills")
          .select("user_id, skill_name, skill_type, proficiency_level, years_experience, profiles(full_name, avatar_url, bio, is_verified)")
          .neq("user_id", userId);

        if (otherSkills && otherSkills.length > 0) {
          const dbCandidatesMap = new Map<string, CandidateUser>();

          for (const s of otherSkills) {
            const uid = s.user_id;
            if (!dbCandidatesMap.has(uid)) {
              dbCandidatesMap.set(uid, {
                userId: uid,
                fullName: (s.profiles as any)?.full_name || "Community Mentor",
                avatarUrl:
                  (s.profiles as any)?.avatar_url ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                bio: (s.profiles as any)?.bio,
                isVerified: (s.profiles as any)?.is_verified || false,
                teaches: [],
                learns: [],
                availability: ["Weekday Evenings", "Weekend Flexible"],
                learningStyle: "hands-on",
              });
            }

            const cand = dbCandidatesMap.get(uid)!;
            const skillType = s.skill_type?.toLowerCase();
            const prof = (s.proficiency_level?.toLowerCase() || "intermediate") as any;

            if (skillType === "teach") {
              cand.teaches.push({
                skillName: s.skill_name,
                proficiency: prof,
                yearsExperience: s.years_experience || 2,
              });
            } else {
              cand.learns.push({
                skillName: s.skill_name,
                proficiencyTarget: prof,
              });
            }
          }

          if (dbCandidatesMap.size > 0) {
            const dbList = Array.from(dbCandidatesMap.values());
            // Merge with default candidates to ensure robust discovery pool
            candidatePool = [...dbList, ...DEFAULT_CANDIDATE_POOL.filter(
              (def) => !dbList.some((c) => c.userId === def.userId)
            )];
          }
        }
      } catch (dbErr) {
        console.warn("DB candidate fetch fallback to default candidate pool:", dbErr);
      }
    }

    // Run the AI compatibility calculation
    const matches: MatchResult[] = await calculateCompatibilityMatches(
      currentUserContext,
      candidatePool
    );

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      matches,
      scanMetadata: {
        scannedCount: candidatePool.length,
        durationMs,
        userScanned: currentUserContext.fullName,
      },
    });
  } catch (err: any) {
    console.error("AI Match route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
