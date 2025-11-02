/**
 * Server-side Model System Store
 * Stores model instances by their ID to avoid recreating them on each request
 * No limit on number of instances - stores all models indefinitely
 */
class ModelSystemStore {
  private models: Map<string, any> = new Map();

  constructor() {
    // Constructor
  }

  /**
   * Get model instance by ID
   * @param modelId - Model identifier (e.g., "product.ProductModel")
   * @returns Model instance if exists, null otherwise
   */
  public get(modelId: string): any | null {
    return this.models.get(modelId) || null;
  }

  /**
   * Set model instance with ID
   * @param modelId - Model identifier
   * @param instance - Model instance to store
   */
  public set(modelId: string, instance: any): void {
    this.models.set(modelId, instance);
  }

  /**
   * Check if model exists in store
   * @param modelId - Model identifier
   * @returns true if model exists, false otherwise
   */
  public has(modelId: string): boolean {
    return this.models.has(modelId);
  }

  /**
   * Get or create model instance
   * If model doesn't exist, create it using factory function and store it
   * @param modelId - Model identifier
   * @param factory - Factory function to create model instance if not exists
   * @returns Model instance
   */
  public getOrCreate<T>(
    modelId: string,
    factory: () => T | Promise<T>
  ): T | Promise<T> {
    if (this.has(modelId)) {
      return this.get(modelId) as T;
    }

    const instance = factory();

    // Handle both sync and async factory
    if (instance instanceof Promise) {
      return instance.then((inst) => {
        this.set(modelId, inst);
        return inst;
      }) as Promise<T>;
    }

    this.set(modelId, instance);
    return instance;
  }

  /**
   * Remove model instance from store
   * @param modelId - Model identifier
   */
  public remove(modelId: string): boolean {
    return this.models.delete(modelId);
  }

  /**
   * Clear all models from store
   */
  public clear(): void {
    this.models.clear();
  }

  /**
   * Get all model IDs in store
   */
  public getAllKeys(): string[] {
    return Array.from(this.models.keys());
  }

  /**
   * Get store size
   */
  public size(): number {
    return this.models.size;
  }

  /**
   * Get store statistics
   */
  public getStats() {
    return {
      currentSize: this.models.size,
      totalModels: this.models.size,
    };
  }
}

const modelSystemStore = new ModelSystemStore();
export default modelSystemStore;
export { ModelSystemStore };

