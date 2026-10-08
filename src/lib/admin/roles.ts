/**
 * Admin Roles and Authorization Rules (Isomorphic - Client & Server safe)
 *
 * Contains pure functions and constants for role verification.
 * Does not import any server-only modules (like cookies or next/headers).
 */

export { PRIMARY_ADMIN_EMAIL, isUserAdmin } from '@/lib/roles';

export const ALLOWED_ADMIN_EMAILS: string[] = [
  'elanghovansabareesh0921@gmail.com',
  ...(typeof process !== 'undefined' && (process.env?.ADMIN_EMAILS || process.env?.NEXT_PUBLIC_ADMIN_EMAILS)
    ? (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase())
    : []),
];

