/**
 * Next.js Instrumentation Hook
 * This file runs code on server startup
 * https://nextjs.org/docs/app/api-reference/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Only run on server-side (Node.js runtime)
    // Import AutoLoadModel to trigger model loading
    await import("./module-base/server/controllers/AutoLoadModel");
  }
}
