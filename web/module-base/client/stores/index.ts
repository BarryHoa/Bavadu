/**
 * Stores - Client-side state management
 *
 * This directory contains Zustand stores for managing client-side application state:
 * - Root store: Global app state (user, settings, UI state)
 * - Messages store: i18n messages management
 * - Create store: Factory function to create dynamic stores (Redux-like pattern)
 * - Future stores: Module-specific stores, etc.
 */

// Messages store
export { useMessagesStore } from "./messages-store";

// Create store factory
export {
  createStore,
  inject,
  type CreateStoreOptions,
  type CreateStoreReturn,
  type StoreHook,
} from "./create-store";
