import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const requestedNext = searchParams.get('next') ?? '/dashboard';
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//')
    ? requestedNext
    : '/dashboard';

  if (code) {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnmpzjpthszfnovrdrqi.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubXB6anB0aHN6Zm5vdnJkcnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyOTg1MDUsImV4cCI6MjEwNjg3NDUwNX0.IMYQM8stT-qMkXtQM7TCkiNgVbO8Ydf0mt7yVrszmWc';

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('id, full_name, is_onboarded')
            .eq('id', user.id)
            .maybeSingle();

          // Derive name from user email or OAuth metadata
          const emailPrefix = user.email ? user.email.split('@')[0] : '';
          const cleanedPrefix = emailPrefix.replace(/[._-]+/g, ' ').trim();
          const derivedNameFromEmail = cleanedPrefix
            .split(' ')
            .filter(Boolean)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');

          const providerName = (user.user_metadata?.full_name || user.user_metadata?.name || '').trim();
          const preferredName = providerName || derivedNameFromEmail || 'Member';
          const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || '/avatars/avatar_1.jpg';

          if (!dbProfile) {
            await supabase.from('profiles').insert({
              id: user.id,
              email: user.email,
              full_name: preferredName,
              avatar_url: avatarUrl,
              is_onboarded: false,
            });
            return NextResponse.redirect(`${origin}/onboarding`);
          } else if (!dbProfile.is_onboarded) {
            if (!dbProfile.full_name) {
              await supabase.from('profiles').update({
                full_name: preferredName,
              }).eq('id', user.id);
            }
            return NextResponse.redirect(`${origin}/onboarding`);
          }
        }
      } catch (profileErr) {
        console.warn('OAuth callback profile initialization warning:', profileErr);
      }
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error('OAuth exchangeCodeForSession error:', error);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
