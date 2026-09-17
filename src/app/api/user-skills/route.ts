import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { userId, skillName, category, skillType, level, goal } = await req.json();

    if (!userId || !skillName || !skillType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Ensure skill exists in master catalog
    let { data: skillRecord } = await supabase
      .from("skills")
      .select("id")
      .ilike("name", skillName.trim())
      .maybeSingle();

    if (!skillRecord) {
      const { data: newSkill, error: insertError } = await supabase
        .from("skills")
        .insert({ name: skillName.trim(), category: category || "General" })
        .select("id")
        .single();

      if (insertError) throw insertError;
      skillRecord = newSkill;
    }

    // 2. Link skill to user
    const { data: userSkill, error: linkError } = await supabase
      .from("user_skills")
      .insert({
        user_id: userId,
        skill_id: skillRecord.id,
        skill_type: skillType,
        level: level || "Intermediate",
        goal: goal || "",
      })
      .select("id, skill_type, level, goal, skills(name)")
      .single();

    if (linkError) throw linkError;

    return NextResponse.json({ success: true, userSkill });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userSkillId } = await req.json();

    if (!userSkillId) {
      return NextResponse.json({ error: "Missing userSkillId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from("user_skills")
      .delete()
      .eq("id", userSkillId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}