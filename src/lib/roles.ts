/**
 * Centralized Role-Based Access Control (RBAC) Utility
 * 
 * Defines and validates platform roles (Member vs Administrator).
 */

export interface UserRoleCheckInput {
  app_metadata?: Record<string, unknown> | null;
}

/**
 * Determines whether a given user possesses Administrator privileges.
 * Client-side display hint only. Server authorization also checks the profile flag.
 */
export function isUserAdmin(user?: UserRoleCheckInput | null): boolean {
  if (!user) return false;

  return user.app_metadata?.role === 'admin';
}
