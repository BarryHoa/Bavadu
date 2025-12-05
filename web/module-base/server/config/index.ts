/**
 * Centralized configuration for server-side settings
 * All configuration values are imported from separate config files
 */

// ============================================================================
// RATE LIMITING CONFIGURATION
// ============================================================================
export { RATE_LIMIT_CONFIG } from "./rate-limit";

// ============================================================================
// CSRF TOKEN CONFIGURATION
// ============================================================================
export { CSRF_CONFIG } from "./csrf";

// ============================================================================
// SESSION CONFIGURATION
// ============================================================================
export { SESSION_CONFIG } from "./session";

// ============================================================================
// AUTHENTICATION CONFIGURATION
// ============================================================================
export { AUTH_CONFIG } from "./auth";

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================
export { DATABASE_CONFIG } from "./database";

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================
export { SYSTEM_CONFIG } from "./system";

// ============================================================================
// LOGGING CONFIGURATION
// ============================================================================
export { LOG_CONFIG } from "./log";

// ============================================================================
// EXPORT ALL CONFIG
// ============================================================================
import { AUTH_CONFIG } from "./auth";
import { CSRF_CONFIG } from "./csrf";
import { DATABASE_CONFIG } from "./database";
import { LOG_CONFIG } from "./log";
import { RATE_LIMIT_CONFIG } from "./rate-limit";
import { SESSION_CONFIG } from "./session";
import { SYSTEM_CONFIG } from "./system";

export const CONFIG = {
  rateLimit: RATE_LIMIT_CONFIG,
  csrf: CSRF_CONFIG,
  session: SESSION_CONFIG,
  auth: AUTH_CONFIG,
  database: DATABASE_CONFIG,
  system: SYSTEM_CONFIG,
  log: LOG_CONFIG,
} as const;
