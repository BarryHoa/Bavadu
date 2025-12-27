import { AUTH_CONFIG, AuthConfig } from "./auth";
import { CSRF_CONFIG, CsrfConfig } from "./csrf";
import { DATABASE_CONFIG, DatabaseConfig } from "./database";
import { LOG_CONFIG, LogConfig } from "./log";
import { RATE_LIMIT_CONFIG, RateLimitConfig } from "./rate-limit";
import { REDIS_CONFIG, RedisConfig } from "./redis";
import { SESSION_CONFIG, SessionConfig } from "./session";
import { SYSTEM_CONFIG, SystemConfig } from "./system";

export type Config = {
  rateLimit: RateLimitConfig;
  csrf: CsrfConfig;
  session: SessionConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
  system: SystemConfig;
  log: LogConfig;
  redis: RedisConfig;
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
} as const satisfies Config;
