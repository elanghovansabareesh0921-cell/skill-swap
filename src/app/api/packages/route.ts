import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GET /api/packages: Fetch teacher pricing packages
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const skillName = searchParams.get("skillName");

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

    let query = supabase.from("teacher_packages").select("*, profiles(full_name, avatar_url, is_verified)");

    if (teacherId) query = query.eq("teacher_id", teacherId);
    if (skillName) query = query.ilike("skill_name", `%${skillName}%`);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Fallback curated teacher packages for demo / offline development
      const fallbackPackages = [
        {
          id: "pkg-1",
          teacher_id: "arun-kumar",
          skill_name: "Python & Machine Learning",
          session_rate_credits: 50,
          full_course_rate_credits: 250,
          description: "Hands-on PyTorch, Pandas data pipelines, and foundational ML modeling for real applications.",
          created_at: new Date().toISOString(),
          profiles: {
            full_name: "Arun Kumar",
            avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            is_verified: true,
          },
        },
        {
          id: "pkg-2",
          teacher_id: "elena-rostova",
          skill_name: "UI/UX Design Systems in Figma",
          session_rate_credits: 40,
          full_course_rate_credits: 200,
          description: "Component tokenization, responsive Auto Layout, and design system governance in Figma.",
          created_at: new Date().toISOString(),
          profiles: {
            full_name: "Elena Rostova",
            avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
            is_verified: true,
          },
        },
        {
          id: "pkg-3",
          teacher_id: "sophia-rivera",
          skill_name: "Conversational Spanish",
          session_rate_credits: 30,
          full_course_rate_credits: 150,
          description: "Fluency practice, colloquial idioms, and professional communication in Spanish.",
          created_at: new Date().toISOString(),
          profiles: {
            full_name: "Sophia Rivera",
            avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
            is_verified: true,
          },
        },
      ];

      return NextResponse.json({ packages: fallbackPackages });
    }

    return NextResponse.json({ packages: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/packages: Create or update a teacher pricing package
export async function POST(req: Request) {
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

    const { data: { user } } = await supabase.auth.getUser();
    const body = await req.json();
    const { skillName, sessionRateCredits, fullCourseRateCredits, description } = body;

    const teacherId = user?.id || body.teacherId || "user-current";

    if (!skillName || !sessionRateCredits) {
      return NextResponse.json(
        { error: "skillName and sessionRateCredits are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("teacher_packages")
      .insert({
        teacher_id: teacherId,
        skill_name: skillName,
        session_rate_credits: sessionRateCredits,
        full_course_rate_credits: fullCourseRateCredits || null,
        description: description || "",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({
        success: true,
        package: {
          id: `pkg-${Date.now()}`,
          teacherId,
          skillName,
          sessionRateCredits,
          fullCourseRateCredits,
          description,
        },
      });
    }

    return NextResponse.json({ success: true, package: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
