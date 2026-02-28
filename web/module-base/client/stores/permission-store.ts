"use client";

import type { CreateStoreReturn } from "@base/client/stores/create-store";
import { createStore } from "@base/client/stores/create-store";

/** BroadcastChannel name for cross-tab sync (logout / login in another tab) */
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
  roleCodes: string[];
  permissions: Set<string>;
  isGlobalAdmin: boolean;
  adminModules?: Set<string>;
}

/** Store state: only data + set/clear. No check logic here. */
export interface PermissionStoreState extends PermissionStatePayload {
  setPermissions: (payload: PermissionStatePayload) => void;
  clearPermissions: () => void;
}

const initialState: PermissionStatePayload = {
  roleCodes: [],
  permissions: new Set(),
  isGlobalAdmin: false,
  adminModules: new Set<string>(),
};

/** Permission data store (createStore pattern, key in root-store) */
const permissionDataStore: CreateStoreReturn<PermissionStatePayload> =
  createStore({
    key: "permissions",
    init: initialState,
  });

/**
 * Subscribe to permission store (data only).
 * Use with selector: usePermissionsStore((s) => s.user)
 * Or without selector: usePermissionsStore() for full state
 */
export function usePermissionsStore(): PermissionStoreState;
export function usePermissionsStore<R>(
  selector: (state: PermissionStoreState) => R,
): R;
export function usePermissionsStore<R>(
  selector?: (state: PermissionStoreState) => R,
): R | PermissionStoreState {
  const data = permissionDataStore.useSelector((d) => d);
  const store = permissionDataStore;

  const state: PermissionStoreState = {
    ...data,
    setPermissions: (payload: PermissionStatePayload) =>
      store.setValue(payload),
    clearPermissions: () => store.clearValue(),
  };

  if (selector) return selector(state) as R;
  return state;
}

/** Direct access without subscription (e.g. after login, in Nav, listener) */
export function getPermissionsStoreState(): PermissionStoreState {
  const data = permissionDataStore.getValue();
  const store = permissionDataStore;

  return {
    ...data,
    setPermissions: (payload: PermissionStatePayload) =>
      store.setValue(payload),
    clearPermissions: () => store.clearValue(),
  };
}

/** Notify other tabs to clear permissions (call after logout in current tab) */
export function broadcastPermissionsClear() {
  broadcast("clear");
}

/** Notify other tabs to refetch permissions (call after login in current tab) */
export function broadcastPermissionsRefresh() {
  broadcast("refresh");
}
