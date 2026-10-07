import { createClient } from '@/lib/supabase/client';

export type Profile = {
  name: string;
  avatar: string;
  sex: string;
  dob: string;
  teach: string[];
  noTeach: boolean;
  learn: string[];
  headline?: string;
  bio?: string;
  city?: string;
  country?: string;
  timezone?: string;
  languages?: string[];
  hourlyRate?: number;
  experienceYears?: number;
  isAcceptingRequests?: boolean;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  allowedDurations?: number[];
  availability?: Record<string, string[]>;
};

export type Session = { email: string; provider: "google" | "github" | "email" };

const read = <T>(k: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(k) ?? "null");
  } catch {
    return null;
  }
};

export const getSession = () => read<Session>("ss_session");
export const getProfile = () => read<Profile>("ss_profile");
export const saveProfile = async (p: Profile) => {
  if (typeof window !== "undefined") localStorage.setItem("ss_profile", JSON.stringify(p));

  // Sync to Supabase in the background
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await fetch('/api/profile/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          profile: p
        })
      });
    }
  } catch (err) {
    console.error('Failed to sync profile to Supabase', err);
  }
};
export const signOut = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ss_session");
    localStorage.removeItem("ss_profile");
  }
  try {
    const supabase = createClient();
    supabase.auth.signOut();
  } catch (err) {
    console.error('Sign out error', err);
  }
};

const start = async (s: Session) => {
  await new Promise((r) => setTimeout(r, 400));
  if (typeof window !== "undefined") localStorage.setItem("ss_session", JSON.stringify(s));
};

export const DEFAULT_DEMO_PROFILE: Profile = {
  name: 'Alex Chen',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  sex: 'other',
  dob: '1998-05-15',
  teach: ['Full-Stack Web Dev', 'UI/UX Design'],
  noTeach: false,
  learn: ['Python for Data Science', 'Machine Learning'],
  headline: 'Full-Stack Engineer & Interaction Designer',
  bio: 'Passionate about building intuitive software, teaching web architecture, and learning machine learning. 5+ years of production experience in React, Node, and TypeScript.',
  city: 'Bengaluru',
  country: 'IN',
  timezone: 'Asia/Kolkata',
  languages: ['English', 'Hindi'],
  hourlyRate: 50,
  experienceYears: 4,
  isAcceptingRequests: true,
  githubUrl: 'https://github.com/alexchen',
  linkedinUrl: 'https://linkedin.com/in/alexchen',
  websiteUrl: 'https://alexchen.dev',
};

// Uses Supabase Auth to handle Google/GitHub Login and GMeet scopes
export const signInWithProvider = async (p: "google" | "github", nextUrl?: string) => {
  // Maintain mock compatibility before redirect
  if (typeof window !== "undefined") {
    localStorage.setItem("ss_session", JSON.stringify({ email: `${p}-user@example.com`, provider: p }));
    if (nextUrl === '/dashboard' && !getProfile()) {
      saveProfile(DEFAULT_DEMO_PROFILE);
    } else if (nextUrl === '/onboarding') {
      localStorage.removeItem("ss_profile");
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    // Graceful fallback for mock/demo mode when Supabase is not configured
    await new Promise((r) => setTimeout(r, 400));
    return { isOAuth: false };
  }

  const supabase = createClient();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectTarget = nextUrl
    ? `${origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`
    : `${origin}/auth/callback`;
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: p,
    options: {
      redirectTo: redirectTarget,
    },
  });

  if (error) {
    throw error;
  }
  return { isOAuth: true };
};

export const signInWithEmail = async (email: string, _password: string) => {
  await start({ email, provider: "email" });
  return { isOAuth: false };
};
