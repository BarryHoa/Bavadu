/**
 * Next.js Instrumentation Hook
 * In this project we run a custom Node server (`server.ts`),
 * so this hook effectively becomes a no-op.
 * It is kept only to satisfy Next.js' optional instrumentation entry.
 */

// Log immediately when file is loaded (before register is called)
console.log("> 📦 instrumentation.ts file loaded");

export async function register() {
  // No-op: runtime is initialized and cron is started by the custom server.
  console.log("> ⏭️  Instrumentation hook disabled (custom server in use)");
}
