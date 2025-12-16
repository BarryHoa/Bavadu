import { RuntimeContext } from "../runtime/RuntimeContext";

/**
 * Initialize shared runtime (DB connections, models, config).
 * Safe to call multiple times; underlying initializer is idempotent.
 */
export async function initializeRuntime(): Promise<void> {
  const context = RuntimeContext.getInstance();

  await context.ensureInitialized();
}
