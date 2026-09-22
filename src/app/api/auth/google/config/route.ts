import { NextResponse } from "next/server";

export async function GET() {
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

  return NextResponse.json({
    clientId,
    clientSecret,
    supabaseCallbackUrl: "https://nzctpjbsilflawpdicqr.supabase.co/auth/v1/callback",
  });
}
