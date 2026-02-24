import type { PgTable } from "drizzle-orm/pg-core";
import type { CacheOptions, CacheResult } from "../runtime/cache";

import { CACHE_NOT_FOUND } from "../runtime/cache";
import { RuntimeContext } from "../runtime/RuntimeContext";

import { BaseModel } from "./BaseModel";

/**
 * Base model với hỗ trợ Redis cache.
 * - Định nghĩa prefix chung cho model.
 * - Cung cấp helper để build key và get/set/delete cache.
 *
 * TTable: bảng Drizzle chính của model.
 * TValue: kiểu dữ liệu lưu trong cache (mặc định là unknown).
 */
export class BaseModelCached<
  TTable extends PgTable = PgTable,
  TValue = unknown,
> extends BaseModel<TTable> {
  /** Prefix Redis cho model, ví dụ: "user-saving:" */
  protected cachePrefix!: string;

  /** Symbol CACHE_NOT_FOUND để các model con có thể so sánh kết quả cache. */
  protected readonly CACHE_NOT_FOUND = CACHE_NOT_FOUND;

  protected getCache() {
    try {
      return RuntimeContext.getInstance().getRedisCache();
    } catch {
      return undefined;
    }
  }

  protected getCacheKey(key: string): string {
    return key;
  }

  /**
   * Đọc từ cache theo key đã build sẵn.
   * Trả về CACHE_NOT_FOUND nếu:
   * - Redis disable / không kết nối
   * - Không có key trong Redis
   */
  protected async cacheGet<T = TValue>(key: string): Promise<CacheResult<T>> {
    const cache = this.getCache();

    if (!cache) {
      return CACHE_NOT_FOUND;
    }

    const finalKey = this.getCacheKey(key);

    return cache.get<T>(finalKey, { prefix: this.cachePrefix });
  }

  /**
   * Ghi giá trị vào cache với key đã build sẵn.
   */
  protected async cacheSet<T = TValue>(
    value: T,
    key: string,
    options?: CacheOptions,
  ): Promise<boolean> {
    const cache = this.getCache();

    if (!cache) {
      return false;
    }

    const finalKey = this.getCacheKey(key);

    return cache.set<T>(finalKey, value, {
      prefix: this.cachePrefix,
      ...options,
    });
  }

  /**
   * Xóa một key cache theo key đã build sẵn.
   */
  protected async cacheDelete(key: string): Promise<boolean> {
    const cache = this.getCache();

    if (!cache) {
      return false;
    }

    const finalKey = this.getCacheKey(key);

    return cache.delete(finalKey, { prefix: this.cachePrefix });
  }

  /**
   * Xóa nhiều key cache cùng lúc, với danh sách key đã build sẵn.
   */
  protected async cacheDeleteMany(keys: string[]): Promise<number> {
    const cache = this.getCache();

    if (!cache || keys.length === 0) {
      return 0;
    }

    const finalKeys = keys.map((key) => this.getCacheKey(key));

    return cache.deleteMany(finalKeys, { prefix: this.cachePrefix });
  }
}

export default BaseModelCached;
