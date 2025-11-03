
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
class Environment {
  private db: any;
  private models: any;
  constructor() {
    // Create connection using standard PostgreSQL environment variables
    const sslMode = process.env.PGSSLMODE || "disable";
    const channelBinding = process.env.PGCHANNELBINDING || "";
    const connectionString = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?sslmode=${sslMode}${channelBinding ? `&channel_binding=${channelBinding}` : ""}`;
    const client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    // Create Drizzle instance
    const db = drizzle(client, {  });
    this.db = db;
    this.models = new Map<string, any>();  ;
  }

  getDb(): any {
    return this.db;
  }

  hasModel(modelId: string): boolean {
    return this.models.has(modelId);
  }

  getModelKeys(): string[] {
    return Array.from(this.models.keys());
  }

  getModelSize(): number {
    return this.models.size || 0;
  }

  getModel(modelId: string): any {
    return this.models.get(modelId);
  }

  setModel(modelId: string, model: any): void {
    this.models.set(modelId, model);
  }
  registerModels = async () => {
    // const models = await import("@mdl/product/server/models/Product/ProductModel");
    // console.log("Registering product.product model", models.default);
    // this.setModel("product.product", new models.default());
  }
}

// Singleton instance
let envInstance: Environment | null = null;

export function getEnv(): Environment {
  if (!envInstance) {
    envInstance = new Environment();
  }
  return envInstance;
}

// Export default for convenience
export default getEnv;

// Export Environment class for advanced usage
export { Environment };
