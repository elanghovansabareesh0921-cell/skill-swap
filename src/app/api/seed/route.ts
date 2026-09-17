import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Ensure canonical skills exist in the skills table
    const sampleSkills = [
      { name: "Python", category: "Programming" },
      { name: "Docker", category: "DevOps" },
      { name: "Next.js", category: "Web Development" },
      { name: "System Design", category: "Architecture" },
      { name: "UI/UX Design", category: "Design" },
    ];

    for (const s of sampleSkills) {
      await supabase.from("skills").upsert(s, { onConflict: "name" });
    }

    const { data: dbSkills } = await supabase.from("skills").select("id, name");

    const getSkillId = (name: string) =>
      dbSkills?.find((s) => s.name.toLowerCase() === name.toLowerCase())?.id;

    // 2. Fetch or identify active test users
    const { data: profiles, error: profileErr } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .limit(2);

    if (profileErr) throw profileErr;

    if (!profiles || profiles.length < 2) {
      return NextResponse.json({
        error: "At least 2 registered users are required in profiles to generate reciprocal test data.",
      }, { status: 400 });
    }

    const [userA, userB] = profiles;

    // 3. Seed complementary skills between User A and User B
    // User A teaches Python & Next.js, wants to learn Docker & UI/UX Design
    // User B teaches Docker & UI/UX Design, wants to learn Python
    const pythonId = getSkillId("Python");
    const dockerId = getSkillId("Docker");
    const nextjsId = getSkillId("Next.js");
    const designId = getSkillId("UI/UX Design");

    const skillsToAssign = [
      { user_id: userA.id, skill_id: pythonId, skill_type: "TEACH", level: "Advanced" },
      { user_id: userA.id, skill_id: nextjsId, skill_type: "TEACH", level: "Intermediate" },
      { user_id: userA.id, skill_id: dockerId, skill_type: "LEARN", level: "Beginner" },
      { user_id: userA.id, skill_id: designId, skill_type: "LEARN", level: "Beginner" },

      { user_id: userB.id, skill_id: dockerId, skill_type: "TEACH", level: "Advanced" },
      { user_id: userB.id, skill_id: designId, skill_type: "TEACH", level: "Intermediate" },
      { user_id: userB.id, skill_id: pythonId, skill_type: "LEARN", level: "Beginner" },
    ].filter((item) => item.skill_id !== undefined);

    for (const item of skillsToAssign) {
      await supabase.from("user_skills").upsert(item, {
        onConflict: "user_id,skill_id,skill_type",
      });
    }

    // 4. Ensure baseline balance of credits
    await supabase.from("profiles").update({ credits: 50 }).eq("id", userA.id);
    await supabase.from("profiles").update({ credits: 50 }).eq("id", userB.id);

    return NextResponse.json({
      success: true,
      message: "Reciprocal test data seeded successfully between profiles.",
      users: [userA.full_name, userB.full_name],
      assignedSkillsCount: skillsToAssign.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}