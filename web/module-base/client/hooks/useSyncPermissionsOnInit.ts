"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import userService from "@base/client/services/UserService";
import { usePermissionsStore } from "@base/client/stores";

/**
 * Call once in authenticated layout (e.g. WorkspaceLayoutClient).
 * Fetches getMeWithRoles and syncs to permission store so permissions
 * are available on init even if no child uses useCurrentUserCapabilities.
 */
export function useSyncPermissionsOnInit() {
  const { data } = useQuery({
    queryKey: ["meWithRoles"],
    queryFn: () => userService.getMeWithRoles(),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data?.data) {
      usePermissionsStore.getState().setPermissions(data.data);
    }
  }, [data?.data]);
}
