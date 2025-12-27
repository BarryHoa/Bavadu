import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { IConnectionPool } from "./types";

import { existsSync, readdirSync } from "fs";
import { join, relative } from "path";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { Debug } from "./Debug";

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
  db: PostgresJsDatabase<any> | any;
  isPrimary: boolean;
  config?: DbConnectionConfig;
}

/**
 * Connection Pool Manager
 * - Loads schemas from modules and wires drizzle/postgres connections
 */
export class ConnectionPool implements IConnectionPool {
  private readonly projectRoot: string;
  private connections = new Map<string, DatabaseConnection>();
  private primaryConnectionName: string | null = null;
  private isInitialized = false;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    await this.registerPrimaryDatabase();
    this.isInitialized = true;
  }

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

  private async registerPrimaryDatabase(): Promise<void> {
    Debug.log("Connecting to primary database (PostgreSQL)...");

    const isProduction = process.env.NODE_ENV === "production";
    const schemas: SchemaRegistry = {};
    const schemaEntryPoints = this.collectSchemaEntryPoints();

    for (const schemaPath of schemaEntryPoints) {
      try {
        const schemaModule = await import(this.toImportPath(schemaPath));

        Object.assign(schemas, schemaModule);
      } catch (error) {
        Debug.error(`Failed to load schema from ${schemaPath}:`, error);
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

      Debug.log("✅ Primary database (PostgreSQL) connected with schema");
    } catch (error) {
      Debug.forceError("❌ Primary database connection failed:", error);
      throw error;
    }
  }

  private collectSchemaEntryPoints(): string[] {
    const schemaPaths: string[] = [];

    const baseSchema = join(
      this.projectRoot,
      "module-base",
      "server",
      "schemas",
      "index.ts",
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
        "index.ts",
      );

      if (existsSync(schemaPath)) {
        schemaPaths.push(schemaPath);
      }
    }

    return schemaPaths;
  }

  private safeReadDir(dirPath: string): string[] {
    if (!existsSync(dirPath)) return [];

    return readdirSync(dirPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  }

  private toImportPath(targetPath: string): string {
    const relativePath = relative(this.projectRoot, targetPath).replace(
      /\\/g,
      "/",
    );

    return `@/${relativePath}`;
  }

  getConnection(
    name: string = "primary",
  ): PostgresJsDatabase<Record<string, never>> {
    if (!this.isInitialized) {
      throw new Error(
        "ConnectionPool not initialized. Call initialize() first.",
      );
    }

    const connection = this.connections.get(name);

    if (!connection) {
      throw new Error(`Database connection "${name}" not found.`);
    }
    if (!connection.db) {
      throw new Error(`Database connection "${name}" not initialized.`);
    }

    if (connection.type !== "postgres") {
      throw new Error(
        `Database connection "${name}" is not a PostgreSQL connection.`,
      );
    }

    return connection.db as PostgresJsDatabase<Record<string, never>>;
  }

  getPrimaryConnection(): PostgresJsDatabase<Record<string, never>> {
    if (!this.isInitialized || !this.primaryConnectionName) {
      throw new Error(
        "ConnectionPool not initialized. Call initialize() first.",
      );
    }

    const connection = this.connections.get(this.primaryConnectionName);

    if (!connection) {
      throw new Error("Primary database connection not found");
    }

    return connection.db as PostgresJsDatabase<Record<string, never>>;
  }

  hasConnection(name: string): boolean {
    return this.connections.has(name);
  }

  async closeAll(): Promise<void> {
    this.connections.forEach((connection) => {
      if (connection.type === "postgres" && connection.db) {
        const client = (connection.db as any).$client;

        if (client && typeof client.end === "function") {
          client.end();
        }
      }
    });
    this.connections.clear();
    this.primaryConnectionName = null;
    this.isInitialized = false;
  }

  async registerDatabase(
    name: string,
    type: DatabaseType,
    config?: Partial<DbConnectionConfig>,
    schemas?: SchemaRegistry,
  ): Promise<void> {
    if (this.connections.has(name)) {
      Debug.warn(`Database connection "${name}" already exists`);

      return;
    }

    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction && config) {
      Debug.warn(
        `⚠️  Config parameters are ignored in production. Using environment variables only for database "${name}".`,
      );
    }

    Debug.log(`Connecting to database "${name}" (${type})...`);

    try {
      let db: any;

      switch (type) {
        case "postgres": {
          const client = this.createPgClient();

          db = drizzle(client, { schema: schemas }) as PostgresJsDatabase<any>;
          break;
        }
        case "mongo":
          throw new Error("MongoDB connection not yet implemented");
        case "mysql":
          throw new Error("MySQL connection not yet implemented");
        case "sqlite":
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
      Debug.log(`✅ Database "${name}" (${type}) connected`);
    } catch (error) {
      Debug.forceError(`❌ Database "${name}" connection failed:`, error);
      throw error;
    }
  }
}
