import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import { existsSync, readdirSync } from "fs";
import { join, relative } from "path";
import postgres from "postgres";

type SchemaRegistry = Record<string, unknown>;

/**
 * Database connection configuration
 */
export interface DbConnectionConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  sslMode?: string;
  max?: number;
  idleTimeout?: number;
  connectTimeout?: number;
}

/**
 * Database type
 */
export type DatabaseType = "postgres" | "mongo" | "mysql" | "sqlite";

/**
 * Database connection interface
 */
export interface DatabaseConnection {
  name: string;
  type: DatabaseType;
  db: PostgresJsDatabase<any> | any; // Support multiple DB types
  isPrimary: boolean;
  config?: DbConnectionConfig;
}

/**
 * Database class - Manages multiple database connections
 * Supports: PostgreSQL (primary), MongoDB, MySQL, SQLite, etc.
 */
export class Database {
  private readonly projectRoot: string;
  private connections = new Map<string, DatabaseConnection>();
  private primaryConnectionName: string | null = null;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Initialize and register all databases
   */
  async initialize(): Promise<void> {
    await this.registerPrimaryDatabase();
  }

  /**
   * Create PostgreSQL client with configuration from environment variables
   * @param config - Optional configuration to override environment variables (ignored in production)
   * @returns PostgreSQL client instance
   */
  private createPgClient() {
    const config = this.getDefaultConfig();
    return postgres({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: config.sslMode === "require" ? "require" : undefined,
      max: config.max,
      idle_timeout: config.idleTimeout,
      connect_timeout: config.connectTimeout,
    });
  }

  /**
   * Get default connection configuration from environment variables
   * @returns Connection configuration object
   */
  private getDefaultConfig(): DbConnectionConfig {
    return {
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      sslMode: process.env.PGSSLMODE,
      max: 10,
      idleTimeout: 20,
      connectTimeout: 10,
    };
  }

  /**
   * Register primary PostgreSQL database
   */
  private async registerPrimaryDatabase(): Promise<void> {
    console.log("Connecting to primary database (PostgreSQL)...");

    const isProduction = process.env.NODE_ENV === "production";
    const schemas: SchemaRegistry = {};
    const schemaEntryPoints = this.collectSchemaEntryPoints();

    // Load all schemas
    for (const schemaPath of schemaEntryPoints) {
      try {
        const schemaModule = await import(this.toImportPath(schemaPath));
        Object.assign(schemas, schemaModule);
      } catch (error) {
        console.error(`Failed to load schema from ${schemaPath}:`, error);
      }
    }

    try {
      const client = this.createPgClient();
      const db = drizzle(client, {
        schema: schemas,
      }) as PostgresJsDatabase<any>;

      const connection: DatabaseConnection = {
        name: "primary",
        type: "postgres",
        db,
        config: isProduction ? this.getDefaultConfig() : undefined,
        isPrimary: true,
      };

      this.connections.set("primary", connection);
      this.primaryConnectionName = "primary";

      console.log("✅ Primary database (PostgreSQL) connected with schema");
    } catch (error) {
      console.error("❌ Primary database connection failed:", error);
      throw error;
    }
  }

  /**
   * Register additional database connection
   * @param name - Connection name
   * @param type - Database type
   * @param config - Database configuration (ignored in production)
   * @param schemas - Optional schema registry (for SQL databases)
   */
  async registerDatabase(
    name: string,
    type: DatabaseType,
    config?: Partial<DbConnectionConfig>,
    schemas?: SchemaRegistry
  ): Promise<void> {
    if (this.connections.has(name)) {
      console.warn(`Database connection "${name}" already exists`);
      return;
    }

    const isProduction = process.env.NODE_ENV === "production";

    // In production, warn if config is provided but ignore it
    if (isProduction && config) {
      console.warn(
        `⚠️  Config parameters are ignored in production. Using environment variables only for database "${name}".`
      );
    }

    console.log(`Connecting to database "${name}" (${type})...`);

    try {
      let db: any;

      switch (type) {
        case "postgres": {
          // In production, pass undefined to force using only env vars
          const client = this.createPgClient();
          db = drizzle(client, { schema: schemas }) as PostgresJsDatabase<any>;
          break;
        }
        case "mongo":
          // TODO: Implement MongoDB connection
          throw new Error("MongoDB connection not yet implemented");
        case "mysql":
          // TODO: Implement MySQL connection
          throw new Error("MySQL connection not yet implemented");
        case "sqlite":
          // TODO: Implement SQLite connection
          throw new Error("SQLite connection not yet implemented");
        default:
          throw new Error(`Unsupported database type: ${type}`);
      }

      const connection: DatabaseConnection = {
        name,
        type,
        db,
        config: isProduction
          ? this.getDefaultConfig()
          : config || this.getDefaultConfig(),
        isPrimary: false,
      };

      this.connections.set(name, connection);
      console.log(`✅ Database "${name}" (${type}) connected`);
    } catch (error) {
      console.error(`❌ Database "${name}" connection failed:`, error);
      throw error;
    }
  }

  /**
   * Get primary database instance
   * @returns Primary database instance
   */
  getPrimaryDb(): PostgresJsDatabase<any> {
    if (!this.primaryConnectionName) {
      throw new Error("Primary database not initialized");
    }

    const connection = this.connections.get(this.primaryConnectionName);
    if (!connection) {
      throw new Error("Primary database connection not found");
    }

    return connection.db as PostgresJsDatabase<any>;
  }

  /**
   * Get database instance by name
   * @param name - Connection name (default: "primary")
   * @returns Database instance
   */
  getDb(name: string = "primary"): PostgresJsDatabase<any> | any {
    const connection = this.connections.get(name);
    if (!connection) {
      throw new Error(`Database connection "${name}" not found`);
    }

    return connection.db;
  }

  /**
   * Get database connection by name
   * @param name - Connection name
   * @returns Database connection or null
   */
  getConnection(name: string): DatabaseConnection | null {
    return this.connections.get(name) || null;
  }

  /**
   * Check if connection exists
   * @param name - Connection name
   * @returns True if connection exists
   */
  hasConnection(name: string): boolean {
    return this.connections.has(name);
  }

  /**
   * Get all connection names
   * @returns Array of connection names
   */
  getConnectionNames(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * Close all database connections
   */
  async closeAll(): Promise<void> {
    this.connections.forEach((connection) => {
      if (connection.type === "postgres" && connection.db) {
        // Close postgres client
        const client = (connection.db as any).$client;
        if (client && typeof client.end === "function") {
          client.end();
        }
      }
      // TODO: Close other database types
    });
    this.connections.clear();
    this.primaryConnectionName = null;
  }

  /**
   * Collect schema entry points from modules
   */
  private collectSchemaEntryPoints(): string[] {
    const schemaPaths: string[] = [];

    const baseSchema = join(
      this.projectRoot,
      "module-base",
      "server",
      "schemas",
      "index.ts"
    );
    if (existsSync(baseSchema)) {
      schemaPaths.push(baseSchema);
    }

    const modulesRoot = join(this.projectRoot, "modules");
    for (const dir of this.safeReadDir(modulesRoot)) {
      const schemaPath = join(
        modulesRoot,
        dir,
        "server",
        "schemas",
        "index.ts"
      );
      if (existsSync(schemaPath)) {
        schemaPaths.push(schemaPath);
      }
    }

    return schemaPaths;
  }

  /**
   * Safe read directory
   */
  private safeReadDir(dirPath: string): string[] {
    if (!existsSync(dirPath)) return [];

    return readdirSync(dirPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  }

  /**
   * Convert file path to import path
   */
  private toImportPath(targetPath: string): string {
    const relativePath = relative(this.projectRoot, targetPath).replace(
      /\\/g,
      "/"
    );
    return `@/${relativePath}`;
  }
}
