import { createClient } from "redis";

import { REDIS_CONFIG, type RedisConfig } from "../../config/redis";

export enum RedisStatus {
  DISABLED = "DISABLED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  ERROR = "ERROR",
}

export class RedisClientManager {
  private client: ReturnType<typeof createClient> | null = null;
  private status: RedisStatus = RedisStatus.DISABLED;
  private config: RedisConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.config = REDIS_CONFIG;
    if (this.config.enabled) {
      this.initialize();
    }
  }

  private async initialize(): Promise<void> {
    if (!this.config.enabled) {
      this.status = RedisStatus.DISABLED;
      return;
    }

    this.status = RedisStatus.CONNECTING;

    try {
      await this.connectWithRetry();
    } catch (error) {
      console.error("[RedisClientManager] Failed to initialize Redis:", error);
      this.status = RedisStatus.ERROR;
      this.scheduleReconnect();
    }
  }

  private async connectWithRetry(): Promise<void> {
    const { maxAttempts, delayMs, backoffMultiplier } = this.config.retry!;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.connect();
        this.status = RedisStatus.CONNECTED;
        this.reconnectAttempts = 0;
        console.log("[RedisClientManager] ✅ Redis connected successfully");
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(
          `[RedisClientManager] Connection attempt ${attempt}/${maxAttempts} failed:`,
          lastError.message
        );

        if (attempt < maxAttempts) {
          const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error("Redis connection failed after all retries");
  }

  private async connect(): Promise<void> {
    // If URL is provided, use it directly (includes all connection info)
    // Otherwise, construct URL from individual config
    const url =
      this.config.url || `redis://${this.config.host}:${this.config.port}`;

    const clientOptions: Parameters<typeof createClient>[0] = {
      url,
      socket: {
        connectTimeout: this.config.connectionTimeout,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            return new Error("Too many reconnection attempts");
          }
          return Math.min(retries * 100, 3000);
        },
      },
    };

    // Only add password and database if not using URL (URL already contains them)
    if (!this.config.url) {
      if (this.config.password) {
        clientOptions.password = this.config.password;
      }
      clientOptions.database = this.config.db;
    }

    const client = createClient(clientOptions);

    client.on("error", (err) => {
      console.error("[RedisClientManager] Redis client error:", err);
      this.status = RedisStatus.ERROR;
      this.scheduleReconnect();
    });

    client.on("connect", () => {
      console.log("[RedisClientManager] Redis client connecting...");
    });

    client.on("ready", () => {
      console.log("[RedisClientManager] Redis client ready");
      this.status = RedisStatus.CONNECTED;
      this.reconnectAttempts = 0;
    });

    client.on("end", () => {
      console.log("[RedisClientManager] Redis client connection ended");
      this.status = RedisStatus.DISCONNECTED;
    });

    await client.connect();
    this.client = client;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      if (this.status !== RedisStatus.CONNECTED) {
        try {
          await this.connectWithRetry();
        } catch (error) {
          console.error(
            "[RedisClientManager] Reconnection failed, will retry later:",
            error
          );
          this.scheduleReconnect();
        }
      }
    }, delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getClient(): ReturnType<typeof createClient> | null {
    return this.client;
  }

  getStatus(): RedisStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.status === RedisStatus.CONNECTED && this.client !== null;
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.client) {
      await this.client.quit();
      this.client = null;
    }

    this.status = RedisStatus.DISCONNECTED;
  }
}
