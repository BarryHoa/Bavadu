/**
 * ModelSystemStore - Singleton store for model instances
 * Similar to Odoo's Registry pattern
 *
 * Stores model instances by their modelId (e.g., "product.product", "product.ProductModel")
 */

class ModelSystemStore {
  private models: Map<string, any> = new Map();

  /**
   * Set model instance in store
   */
  public set(modelId: string, modelInstance: any): void {
    this.models.set(modelId, modelInstance);
  }

  /**
   * Get model instance from store
   */
  public get<T = any>(modelId: string): T | undefined {
    return this.models.get(modelId) as T | undefined;
  }

  /**
   * Check if model exists in store
   */
  public has(modelId: string): boolean {
    return this.models.has(modelId);
  }

  /**
   * Get all registered model IDs
   */
  public getAllKeys(): string[] {
    return Array.from(this.models.keys());
  }

  /**
   * Get count of registered models
   */
  public size(): number {
    return this.models.size;
  }

  /**
   * Remove model from store
   */
  public delete(modelId: string): boolean {
    return this.models.delete(modelId);
  }

  /**
   * Clear all models from store
   */
  public clear(): void {
    this.models.clear();
  }
}

// Export singleton instance
const modelSystemStore = new ModelSystemStore();

export default modelSystemStore;
export { ModelSystemStore };
