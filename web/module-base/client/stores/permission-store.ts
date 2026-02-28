"use client";

import { create } from "zustand";

import type { AuthUser } from "@base/client/services/UserService";

/** BroadcastChannel name for cross-tab sync (logout/ login in another tab) */
export const PERMISSION_BROADCAST_CHANNEL = "bavadu:permissions";

function broadcast(type: "clear" | "refresh") {
  if (typeof window === "undefined") return;
  try {
    new BroadcastChannel(PERMISSION_BROADCAST_CHANNEL).postMessage({ type });
  } catch {
    // ignore
  }
}

export interface PermissionStatePayload {
  user: AuthUser | null;
  roleCodes: string[];
  permissions: string[];
  isGlobalAdmin: boolean;
}

interface PermissionState {
  user: AuthUser | null;
  roleCodes: string[];
  permissions: string[];
  isGlobalAdmin: boolean;
  setPermissions: (payload: PermissionStatePayload) => void;
  clearPermissions: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

/**
 * Check permission with wildcards (same logic as server):
 * - required (e.g. hrm.employee.view) = exact permission
 * - feature wildcard (e.g. hrm.employee.*) = any permission of feature
 * - module wildcard (e.g. hrm.*) = any permission of module
 */
function hasPermissionWithWildcards(
  userPermissions: string[],
  required: string,
): boolean {
  const set = new Set(userPermissions);
  if (set.has(required)) return true;
  const parts = required.split(".");

  if (parts.length >= 2) {
    const moduleWildcard = `${parts[0]}.*`;
    if (set.has(moduleWildcard)) return true;
  }
  if (parts.length >= 3) {
    const featureWildcard = `${parts[0]}.${parts[1]}.*`;
    if (set.has(featureWildcard)) return true;
  }

  return false;
}

const initialState = {
  user: null as AuthUser | null,
  roleCodes: [] as string[],
  permissions: [] as string[],
  isGlobalAdmin: false,
};

export const usePermissionsStore = create<PermissionState>((set, get) => ({
  ...initialState,

  setPermissions: (payload: PermissionStatePayload) => {
    set({
      user: payload.user,
      roleCodes: payload.roleCodes ?? [],
      permissions: payload.permissions ?? [],
      isGlobalAdmin: payload.isGlobalAdmin ?? false,
    });
  },

  clearPermissions: () => {
    set(initialState);
  },

  hasPermission: (permission: string) => {
    const { permissions, isGlobalAdmin } = get();
    if (isGlobalAdmin) return true;
    return hasPermissionWithWildcards(permissions, permission);
  },

  hasAnyPermission: (permissions: string[]) => {
    const state = get();
    if (state.isGlobalAdmin) return true;
    return permissions.some((p) =>
      hasPermissionWithWildcards(state.permissions, p),
    );
  },

  hasAllPermissions: (permissions: string[]) => {
    const state = get();
    if (state.isGlobalAdmin) return true;
    return permissions.every((p) =>
      hasPermissionWithWildcards(state.permissions, p),
    );
  },
}));

/** Notify other tabs to clear permissions (call after logout in current tab) */
export function broadcastPermissionsClear() {
  broadcast("clear");
}

/** Notify other tabs to refetch permissions (call after login in current tab) */
export function broadcastPermissionsRefresh() {
  broadcast("refresh");
}
