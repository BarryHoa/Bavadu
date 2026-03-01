/**
 * Preload for Bun: expose AsyncLocalStorage on globalThis so Next.js can use it.
 * Next.js checks `globalThis.AsyncLocalStorage`; in Bun it exists in node:async_hooks
 * but is not on globalThis by default → "AsyncLocalStorage accessed in runtime where it is not available".
 */
const { AsyncLocalStorage } = require("node:async_hooks");
if (typeof globalThis !== "undefined") {
  globalThis.AsyncLocalStorage = AsyncLocalStorage;
}
