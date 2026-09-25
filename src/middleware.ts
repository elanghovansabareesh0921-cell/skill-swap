import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://nzctpjbsilflawpdicqr.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56Y3RwamJzaWxmbGF3cGRpY3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2Mzg5ODYsImV4cCI6MjEwNTIxNDk4Nn0.g2TSKAgXx7qdkZybse6YWLPLQ5aUwnaZX4olLNHwLI4";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/matches") ||
    pathname.startsWith("/session") ||
    pathname.startsWith("/credits") ||
    pathname.startsWith("/discover") ||
    pathname.startsWith("/skills") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/teach") ||
    pathname.startsWith("/learn") ||
    pathname.startsWith("/onboarding");

  // Fast-path cookie check: zero network latency
  const hasSessionCookie =
    request.cookies.get("skillswap_session")?.value === "true" ||
    request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

  // 1. Unauthenticated users trying to access protected routes -> redirect immediately to /login (0ms)
  if (isProtectedRoute && !hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (pathname !== "/") {
      url.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(url);
  }

  // 2. Unauthenticated users visiting auth routes (/login, /signup) -> render immediately with 0ms network latency
  if (isAuthRoute && !hasSessionCookie) {
    return NextResponse.next();
  }

  // 3. Already authenticated users trying to access /login or /signup -> redirect to homepage
  if (isAuthRoute && hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 4. Authenticated request on protected route: pass along cookies
  let supabaseResponse = NextResponse.next({
    request,
  });

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
