/**
 * Centralized Role-Based Access Control (RBAC) Utility
 * 
 * Defines and validates platform roles (Member vs Administrator).
 */

export const PRIMARY_ADMIN_EMAIL = 'elanghovansabareesh0921@gmail.com';

export interface UserRoleCheckInput {
  email?: string | null;
  role?: string | null;
  isAdmin?: boolean | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | null;
}

/**
 * Determines whether a given user possesses Administrator privileges.
 * Checks:
 * 1. Explicit role === 'admin' (from JWT metadata or database profile)
 * 2. Explicit isAdmin === true (from database profile flag)
 * 3. Primary platform administrator email
 * 4. Configured NEXT_PUBLIC_ADMIN_EMAILS comma-separated list
 */
export function isUserAdmin(user?: UserRoleCheckInput | null): boolean {
  if (!user) return false;

  if (
    user.role === 'admin' ||
    user.isAdmin === true ||
    user.user_metadata?.role === 'admin' ||
    user.app_metadata?.role === 'admin'
  ) {
    return true;
  }

  const userEmail = (user.email || '').trim().toLowerCase();
  if (!userEmail) return false;

  if (userEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
    return true;
  }

  const configuredAdminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '';
  if (configuredAdminEmails) {
    const adminList = configuredAdminEmails
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (adminList.includes(userEmail)) {
      return true;
    }
  }

  return false;
}
