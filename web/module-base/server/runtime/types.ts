import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { ConnectionPool } from "./ConnectionPool";
import type { ModelInstance } from "./ModelInstance";

/**
 * Runtime context configuration options
 */
export interface RuntimeContextOptions {
  projectRoot?: string;
}

/**
 * Runtime context state
 */
export interface RuntimeContextState {
  /** Connection pool for managing database connections */
  connectionPool: ConnectionPool;
  /** Model instance containing models, menus, etc. */
  modelInstance: ModelInstance;
  /** Initialization timestamp */
  initializedAt: string;
}

/**
 * Connection pool interface
 */
export interface IConnectionPool {
  /**
   * Get database connection by name
   * @param name - Connection name (default: "primary")
   * @returns Database instance
   */
  getConnection(name?: string): PostgresJsDatabase<Record<string, never>>;

  /**
   * Get primary database connection
   * @returns Primary database instance
   */
  getPrimaryConnection(): PostgresJsDatabase<Record<string, never>>;

  /**
   * Check if connection exists
   * @param name - Connection name
   * @returns True if connection exists
   */
  hasConnection(name: string): boolean;

  /**
   * Close all connections
   */
  closeAll(): Promise<void>;
}

/**
 * Config manager interface
 */
export interface IConfigManager {
  /**
   * Get configuration value
   * @param key - Config key
   * @returns Config value or undefined
   */
  get<T = unknown>(key: string): T | undefined;

  /**
   * Check if config is loaded
   * @returns True if config is loaded
   */
  isLoaded(): boolean;
}
