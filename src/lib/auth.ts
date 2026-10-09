import { createClient } from '@/lib/supabase/client';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

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
  teachLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  learnLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  isAcceptingRequests?: boolean;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  allowedDurations?: number[];
  availability?: Record<string, string[]>;
};

export type Session = {
  email: string;
  provider?: "google" | "github" | "email";
  userId?: string;
  token?: string;
  expiresAt?: number;
};

export function deriveNameFromEmail(email?: string | null): string {
  if (!email) return '';
  const username = email.split('@')[0] || '';
  const cleaned = username.replace(/[._-]+/g, ' ').trim();
  const titleCased = cleaned
    .split(' ')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
  return titleCased || username;
}

const read = <T>(k: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(k) ?? "null");
  } catch {
    return null;
  }
};

export const getSession = () => DEMO_MODE ? read<Session>("ss_session") : null;
export const getProfile = () => DEMO_MODE ? read<Profile>("ss_profile") : null;
export const saveProfile = async (p: Profile) => {
  if (DEMO_MODE && typeof window !== "undefined") localStorage.setItem("ss_profile", JSON.stringify(p));

  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Sign in before saving your profile.');

  const response = await fetch('/api/profile/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile: p }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(result?.error || 'Failed to save profile.');
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

// Uses Supabase Auth to handle Google/GitHub Login and GMeet scopes
export const signInWithProvider = async (p: "google" | "github", nextUrl?: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Authentication service is not configured.');
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

export const signUpWithEmail = async (email: string, password: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('Authentication service is not configured.');
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return { isOAuth: false, needsEmailConfirmation: !data.session };
};

export const signInWithEmail = async (email: string, password: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('Authentication service is not configured.');
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { isOAuth: false };
};
