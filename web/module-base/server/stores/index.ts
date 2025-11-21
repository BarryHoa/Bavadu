/**
 * Stores - State management and singleton instances
 *
 * This directory contains stores for managing application state:
 * - Rate limit store: In-memory store for rate limiting
 * - Database: Multi-database connection manager (includes PostgreSQL client creation)
 * - Future stores: Session store, cache store, etc.
 */

export { Database } from "./database";
export type {
  DatabaseConnection,
  DatabaseType,
  DbConnectionConfig,
} from "./database";
export { rateLimitStore, RateLimitStore } from "./rate-limit-store";
