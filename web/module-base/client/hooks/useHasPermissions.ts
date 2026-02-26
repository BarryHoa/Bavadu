"use client";

import { useQuery } from "@tanstack/react-query";

import userService from "@base/client/services/UserService";

export type HasPermissionsMode = "any" | "all";

/**
 * Returns whether the current user has the required permissions.
 * Uses the same getMeWithRoles cache as useCurrentUserCapabilities.
 */
export function useHasPermissions(
  permissions: string[],
  mode: HasPermissionsMode = "any",
): { hasPermission: boolean; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ["meWithRoles"],
    queryFn: () => userService.getMeWithRoles(),
    staleTime: 5 * 60 * 1000,
  });

  const list = data?.data?.permissions ?? [];
  const isGlobalAdmin = data?.data?.isGlobalAdmin ?? false;

  if (permissions.length === 0) {
    return { hasPermission: true, isLoading };
  }

  if (isGlobalAdmin) {
    return { hasPermission: true, isLoading };
  }

  const hasPermission =
    mode === "all"
      ? permissions.every((p) => list.includes(p))
      : permissions.some((p) => list.includes(p));

  return { hasPermission, isLoading };
}
