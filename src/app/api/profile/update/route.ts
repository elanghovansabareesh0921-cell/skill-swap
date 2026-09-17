import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(req: Request) {
  try {
    const { userId, fullName, bio, githubUrl, linkedinUrl, websiteUrl } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        bio,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        website_url: websiteUrl,
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}