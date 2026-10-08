import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { isAdminIdentity } from '@/lib/auth/admin-policy';

export interface AuthenticatedUser {
  id: string;
  email: string | null;
}

export type AuthResult = AuthenticatedUser | NextResponse<{ error: string }>;
type AuthUserResult = User | NextResponse<{ error: string }>;

function authError(status: 401 | 403 | 503, error: string): NextResponse<{ error: string }> {
  return NextResponse.json({ error }, { status });
}

async function getRequestUser(req: Request): Promise<AuthUserResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return authError(503, 'Authentication service is not configured');
  }

  try {
    const authorization = req.headers.get('authorization');
    if (authorization?.startsWith('Bearer ')) {
      const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data, error } = await supabase.auth.getUser(authorization.slice(7));
      if (error || !data.user) return authError(401, 'Authentication required');
      return data.user;
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return authError(401, 'Authentication required');
    return data.user;
  } catch {
    return authError(401, 'Authentication required');
  }
}

export async function requireUser(req: Request): Promise<AuthResult> {
  const user = await getRequestUser(req);
  if (user instanceof NextResponse) return user;
  return { id: user.id, email: user.email ?? null };
}

export async function isServerAdmin(user: User): Promise<boolean> {
  if (isAdminIdentity(user, false, process.env.ADMIN_EMAILS || '')) return true;
  try {
    const { data: profile, error } = await getSupabaseAdmin()
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();
    return !error && profile?.is_admin === true;
  } catch {
    return false;
  }
}

export async function requireAdmin(req: Request): Promise<AuthResult> {
  const user = await getRequestUser(req);
  if (user instanceof NextResponse) return user;
  if (isAdminIdentity(user, false, process.env.ADMIN_EMAILS || '')) {
    return { id: user.id, email: user.email ?? null };
  }

  try {
    const { data: profile, error } = await getSupabaseAdmin()
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (error) return authError(503, 'Administrator access could not be verified');
    if (profile?.is_admin !== true) return authError(403, 'Administrator access required');
    return { id: user.id, email: user.email ?? null };
  } catch {
    return authError(503, 'Administrator access could not be verified');
  }
}