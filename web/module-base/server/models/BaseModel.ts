import { ListParamsRequest } from "./interfaces/ListInterface";

export class BaseModel {
  protected modelId?: string;

  constructor(modelId?: string) {
    this.modelId = modelId;
  }

  /**
   * Get model ID for this instance
   * Models can override this method to return custom model ID
   * Default: returns constructor parameter or null
   */
  getModelId(): string | null {
    return this.modelId || null;
  }

  /**
   * Static method to get model ID from class
   * Models can define static MODEL_ID property to control their name
   * Example: static MODEL_ID = "product";
   */
  static getModelId?(): string | null {
    // Check if model has static MODEL_ID property
    return (this as any).modelId || null;
  }

  getDefaultParamsForList = (params?: ListParamsRequest) => {
    const { offset, limit, search, filters, sorts } = params || {};
    return {
      offset: offset || 0,
      limit: limit || 10,
      search: search || undefined,
      filters: filters || undefined,
      sorts: sorts || undefined,
    };
  };
  getPagination(options: { data?: any; total?: number }) {
    const { data, total = 0 } = options;

    return {
      data,
      total,
    };
  }
}
