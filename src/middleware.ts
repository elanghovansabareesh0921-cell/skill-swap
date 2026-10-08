import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { isUserAdmin } from '@/lib/admin/roles';

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const isAdmin = isUserAdmin(user);

    // If accessing the admin login page
    if (pathname === '/admin/login') {
      // If user is already logged in AND is an admin, redirect them straight to admin swaps
      if (isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/swaps';
        url.search = '';
        return NextResponse.redirect(url);
      }
      // Otherwise allow them to view the admin login page
      return supabaseResponse;
    }

    // For all protected /admin routes:
    if (!user) {
      // Unauthenticated -> redirect to admin login
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(url);
    }

    if (!isAdmin) {
      // Authenticated but not an admin -> redirect to admin login with error notice
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
