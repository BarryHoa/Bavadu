import { AUTH_CONFIG, AuthConfig } from "./auth";
import { CSRF_CONFIG, CsrfConfig } from "./csrf";
import { DATABASE_CONFIG, DatabaseConfig } from "./database";
import { DEBUG_CONFIG, DebugConfig } from "./debug";
import { LOG_CONFIG, LogConfig } from "./log";
import { RATE_LIMIT_CONFIG, RateLimitConfig } from "./rate-limit";
import { REDIS_CONFIG, RedisConfig } from "./redis";
import { SESSION_CONFIG, SessionConfig } from "./session";
import { SYSTEM_CONFIG, SystemConfig } from "./system";

// ============================================================================
// INDIVIDUAL CONFIG EXPORTS
// ============================================================================
export { AUTH_CONFIG, type AuthConfig };
export { CSRF_CONFIG, type CsrfConfig };
export { DATABASE_CONFIG, type DatabaseConfig };
export { DEBUG_CONFIG, type DebugConfig };
export { LOG_CONFIG, type LogConfig };
export { RATE_LIMIT_CONFIG, type RateLimitConfig };
export { REDIS_CONFIG, type RedisConfig };
export { SESSION_CONFIG, type SessionConfig };
export { SYSTEM_CONFIG, type SystemConfig };

// ============================================================================
// UNIFIED CONFIG TYPE & OBJECT
// ============================================================================
export type Config = {
  rateLimit: RateLimitConfig;
  csrf: CsrfConfig;
  session: SessionConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
  system: SystemConfig;
  log: LogConfig;
  redis: RedisConfig;
  debug: DebugConfig;
};

export const CONFIG = {
  rateLimit: RATE_LIMIT_CONFIG,
  csrf: CSRF_CONFIG,
  session: SESSION_CONFIG,
  auth: AUTH_CONFIG,
  database: DATABASE_CONFIG,
  system: SYSTEM_CONFIG,
  log: LOG_CONFIG,
  redis: REDIS_CONFIG,
  debug: DEBUG_CONFIG,
} as const satisfies Config;
