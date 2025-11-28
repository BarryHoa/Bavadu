"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Root store state - contains a Map of all dynamic stores
export interface RootStoreState {
  stores: Map<string, any>;
  setStoreValue: <T>(key: string, value: T) => void;
  getStoreValue: <T>(key: string) => T | undefined;
  clearStoreValue: (key: string) => void;
  hasStore: (key: string) => boolean;
}

// Check if in development mode
// For Next.js, check NODE_ENV and also check window location in client-side
const isDev =
  process.env.NODE_ENV === "development" ||
  (typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"));

// Store creator function
const storeCreator = (set: any, get: any) => ({
  stores: new Map<string, any>(),

  setStoreValue: <T>(key: string, value: T) => {
    set(
      (state: RootStoreState) => {
        const currentStores = ensureMap(state.stores);
        const newStores = new Map(currentStores);
        newStores.set(key, value);
        return { stores: newStores };
      },
      false,
      `setStoreValue:${key}`
    );
  },

  getStoreValue: <T>(key: string) => {
    const stores = ensureMap(get().stores);
    return stores.get(key) as T | undefined;
  },

  clearStoreValue: (key: string) => {
    set(
      (state: RootStoreState) => {
        const currentStores = ensureMap(state.stores);
        const newStores = new Map(currentStores);
        newStores.delete(key);
        return { stores: newStores };
      },
      false,
      `clearStoreValue:${key}`
    );
  },

  hasStore: (key: string) => {
    const stores = ensureMap(get().stores);
    return stores.has(key);
  },
});

// Helper function to convert object/array to Map
const ensureMap = (stores: any): Map<string, any> => {
  if (stores instanceof Map) {
    return stores;
  }
  if (Array.isArray(stores)) {
    return new Map(stores);
  }
  if (stores && typeof stores === "object") {
    return new Map(Object.entries(stores));
  }
  return new Map();
};

// Create root store with Map
// Only add devtools in development mode
const persistedStore = persist(storeCreator, {
  name: "root-store",
  partialize: (state) => ({
    // Convert Map to object for persistence
    stores: Object.fromEntries(state.stores),
  }),
  merge: (persistedState, currentState) => {
    // Convert persisted object back to Map
    const stores = ensureMap(
      (persistedState as any)?.stores || currentState.stores
    );
    return {
      ...currentState,
      stores,
    };
  },
});

// Create root store with devtools enabled in development
// Always enable devtools in dev mode for Redux DevTools
export const rootStore = isDev
  ? create<RootStoreState>()(
      devtools(persistedStore, {
        name: "RootStore",
        enabled: true,
      })
    )
  : create<RootStoreState>()(persistedStore);

// Debug log - always log to help debug
if (typeof window !== "undefined") {
  console.log("🔧 RootStore - isDev:", isDev);
  console.log("🔧 RootStore - NODE_ENV:", process.env.NODE_ENV);
  console.log("🔧 RootStore - hostname:", window.location.hostname);
  console.log("📦 RootStore created:", rootStore);
}

// Direct access (không subscribe, không gây re-render)
export const getRootStoreValue = <T>(key: string): T | undefined => {
  const stores = ensureMap(rootStore.getState().stores);
  return stores.get(key) as T | undefined;
};

export const setRootStoreValue = <T>(key: string, value: T) => {
  rootStore.getState().setStoreValue(key, value);
};

export const clearRootStoreValue = (key: string) => {
  rootStore.getState().clearStoreValue(key);
};

export const hasRootStore = (key: string) => {
  return rootStore.getState().hasStore(key);
};
