/**
 * Admin Roles and Authorization Rules (Isomorphic - Client & Server safe)
 *
 * Contains pure functions and constants for role verification.
 * Does not import any server-only modules (like cookies or next/headers).
 */

/** Primary administrator email */
export const PRIMARY_ADMIN_EMAIL = 'elanghovansabareesh0921@gmail.com';

/** List of allowed administrator emails */
export const ALLOWED_ADMIN_EMAILS: string[] = [
  PRIMARY_ADMIN_EMAIL.toLowerCase(),
  ...(typeof process !== 'undefined' && process.env?.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase())
    : []),
];

/**
 * Pure synchronous function to determine if a user record has admin rights.
 * Safe to run in Client Components, Server Components, API routes, or Middleware.
 */
export function isUserAdmin(
  user: {
    email?: string | null;
    user_metadata?: Record<string, any>;
    app_metadata?: Record<string, any>;
  } | null | undefined
): boolean {
  if (!user) return false;

  const email = user.email?.toLowerCase().trim();
  if (email && ALLOWED_ADMIN_EMAILS.includes(email)) {
    return true;
  }

  if (
    user.user_metadata?.role === 'admin' ||
    user.app_metadata?.role === 'admin'
  ) {
    return true;
  }

  return false;
}
