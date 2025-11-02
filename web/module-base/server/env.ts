/**
 * Environment - Similar to Odoo's env pattern
 * Allows accessing models via env['model.name'] like Odoo
 *
 * Usage:
 *   const env = getEnv();
 *   const productModel = env.get('product.product');
 *
 *   // Check if model exists
 *   if (env.has('product.product')) {
 *     const model = env.get('product.product');
 *   }
 */

import modelSystemStore from "./models/ModelSystemStore";

/**
 * Environment class - tương tự Odoo env
 * Cho phép truy cập models qua env['model.name']
 */
class Environment {
  /**
   * Get model by ID - giống Odoo env['res.partner']
   * @param modelId Model ID (e.g., 'product.product', 'product.ProductModel')
   * @returns Model instance
   * @throws Error if model not found
   */
  get<T = any>(modelId: string): T {
    const model = modelSystemStore.get(modelId);
    if (!model) {
      throw new Error(
        `Model ${modelId} not found in registry. Available models: ${modelSystemStore.getAllKeys().join(", ")}`
      );
    }
    return model as T;
  }

  /**
   * Check if model exists - giống Odoo 'res.partner' in env
   * @param modelId Model ID to check
   * @returns true if model exists
   */
  has(modelId: string): boolean {
    return modelSystemStore.has(modelId);
  }

  /**
   * Get all registered model IDs
   * @returns Array of model IDs
   */
  keys(): string[] {
    return modelSystemStore.getAllKeys();
  }

  /**
   * Get count of registered models
   */
  size(): number {
    return modelSystemStore.size();
  }
}

// Singleton instance
let envInstance: Environment | null = null;

/**
 * Get environment instance - tương tự Odoo self.env
 * Returns singleton instance of Environment
 *
 * @example
 * ```typescript
 * const env = getEnv();
 * const productModel = env.get('product.product');
 * const data = await productModel.getList();
 * ```
 */
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
