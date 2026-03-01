"use client";

import { usePermissionsStore } from "@base/client/stores";

export type HasPermissionsMode = "any" | "all";

/**
 * Check permission with wildcards (same logic as server):
 * - required (e.g. hrm.employee.view) = exact permission
 * - feature wildcard (e.g. hrm.employee.*) = any permission of feature
 * - module wildcard (e.g. hrm.*) = any permission of module
 */
function hasPermissionWithWildcards(
  targetPermission: string,
  allPermissions: Array<string> | Set<string>,
  isGlobalAdmin: boolean,
  adminModules: Set<string>,
): boolean {
  const parts = targetPermission.split(".");
  if (isGlobalAdmin) {
    return true;
  }
  // todo: check admin modules

  let permissions: Set<string> = new Set();
  if (Array.isArray(allPermissions)) {
    permissions = new Set(allPermissions);
  } else if (allPermissions instanceof Set) {
    permissions = allPermissions;
  }

  if (permissions.has(targetPermission)) return true;

  if (parts.length >= 2) {
    const moduleWildcard = `${parts[0]}.*`;
    if (permissions.has(moduleWildcard)) return true;
  }
  if (parts.length >= 3) {
    const featureWildcard = `${parts[0]}.${parts[1]}.*`;
    if (permissions.has(featureWildcard)) return true;
  }

  return false;
}

/**
 * Hook to check permissions. Reads from permission store.
 * Returns hasPermission(perm), hasAnyPermission(perms), hasAllPermissions(perms).
 */
export function usePermission(): {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
} {
  const permissions = usePermissionsStore((s) => s.permissions);
  const isGlobalAdmin = usePermissionsStore((s) => s.isGlobalAdmin);
  const adminModules = usePermissionsStore(
    (s) => s.adminModules ?? new Set<string>(),
  );
  return {
    hasPermission: (targetPermission: string) => {
      if (isGlobalAdmin) return true;
      return hasPermissionWithWildcards(
        targetPermission,
        permissions,
        isGlobalAdmin,
        adminModules,
      );
    },
    hasAnyPermission: (targetPermissions: string[]) => {
      if (isGlobalAdmin) return true;
      return targetPermissions.some((p) =>
        hasPermissionWithWildcards(p, permissions, isGlobalAdmin, adminModules),
      );
    },
    hasAllPermissions: (targetPermissions: string[]) => {
      if (isGlobalAdmin) return true;
      return targetPermissions.every((p) =>
        hasPermissionWithWildcards(p, permissions, isGlobalAdmin, adminModules),
      );
    },
  };
}

/**
 * Returns whether the current user has the required permissions.
 * Reads from permission store (no API call).
 */
export function useHasPermissions(
  permissions: string[],
  mode: HasPermissionsMode = "any",
): { hasPermission: boolean; isLoading: boolean } {
  const { hasAnyPermission, hasAllPermissions } = usePermission();

  if (permissions.length === 0) {
    return { hasPermission: true, isLoading: false };
  }

  const hasPermission =
    mode === "all"
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

  return { hasPermission, isLoading: false };
}
