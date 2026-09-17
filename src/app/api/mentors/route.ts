import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch users who have skills they teach
    const { data: mentors, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        bio,
        github_url,
        linkedin_url,
        website_url,
        user_skills (
          id,
          skill_type,
          level,
          skills (name, category)
        ),
        reviews:reviews!reviewee_id (
          rating
        ),
        sessions:sessions!receiver_id (
          id,
          status,
          duration_minutes
        )
      `);

    if (error) throw error;

    // Transform and filter only profiles that teach at least one skill
    const formattedMentors = (mentors || [])
      .filter((m: any) => m.user_skills?.some((s: any) => s.skill_type === "TEACH"))
      .map((m: any) => {
        const teachSkills = m.user_skills
          .filter((s: any) => s.skill_type === "TEACH")
          .map((s: any) => ({ name: s.skills?.name, level: s.level, category: s.skills?.category }));

        const reviews = m.reviews || [];
        const avgRating =
          reviews.length > 0
            ? Number((reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1))
            : null;

        const completedSwaps = (m.sessions || []).filter((s: any) => s.status === "COMPLETED").length;

        return {
          id: m.id,
          name: m.full_name,
          bio: m.bio,
          githubUrl: m.github_url,
          linkedinUrl: m.linkedin_url,
          websiteUrl: m.website_url,
          teachSkills,
          reviewCount: reviews.length,
          avgRating,
          completedSwaps,
        };
      });

    return NextResponse.json({ mentors: formattedMentors });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}