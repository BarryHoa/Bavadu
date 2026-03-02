"use client";

import { usePermissionsStore } from "@base/client/stores";
import { UserPermission } from "../interface/RoleAndPermission";

export type HasPermissionsMode = "any" | "all";

/**
 * Check permission with wildcards (same logic as server):
 * - required (e.g. hrm.employee.view) = exact permission
 * - feature wildcard (e.g. hrm.employee.*) = any permission of feature
 * - module wildcard (e.g. hrm.*) = any permission of module
 */
function hasPermissionWithWildcards(
  targetPermission: string,
  allPermissions: UserPermission["permissions"],
  isGlobalAdmin: UserPermission["isGlobalAdmin"],
  adminModules: UserPermission["adminModules"],
): boolean {
  const parts = targetPermission.split(".");
  if (isGlobalAdmin) {
    return true;
  }
  // todo: check admin modules

  let permissions = new Set(allPermissions);
  const permissionsSet = new Set(allPermissions);

  if (permissionsSet.has(targetPermission)) return true;

  if (parts.length >= 2) {
    const moduleWildcard = `${parts[0]}.*`;
    if (permissionsSet.has(moduleWildcard)) return true;
  }
  if (parts.length >= 3) {
    const featureWildcard = `${parts[0]}.${parts[1]}.*`;
    if (permissionsSet.has(featureWildcard)) return true;
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
  const adminModules = usePermissionsStore((s) => s.adminModules);

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
