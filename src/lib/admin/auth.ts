/**
 * Admin Authorization Helper (Server-side)
 *
 * Provides server-side access checks for Server Components and API Routes.
 */

import { createClient } from '@/lib/supabase/server';
import { isServerAdmin } from '@/lib/auth/server';

export * from './roles';

export interface AdminCheckResult {
  isAdmin: boolean;
  userId: string | null;
  email: string | null;
}

/**
 * Server-side check using the current request's Supabase session.
 * Returns user info and admin status without throwing errors.
 */
export async function checkAdminAccess(): Promise<AdminCheckResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { isAdmin: false, userId: null, email: null };
    }

    const isAdmin = await isServerAdmin(user);

    return {
      isAdmin,
      userId: user.id,
      email: user.email ?? null,
    };
  } catch {
    return { isAdmin: false, userId: null, email: null };
  }
}
