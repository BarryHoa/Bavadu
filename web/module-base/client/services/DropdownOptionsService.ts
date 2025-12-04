import JsonRpcClientService from "./JsonRpcClientService";

export interface DropdownOption {
  label: string;
  value: string;
  [key: string]: any;
}

export interface DropdownOptionsParams {
  offset?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, any>;
  sorts?: Array<{ column: string; direction: "ascending" | "descending" }>;
}

export interface DropdownOptionsResponse {
  data: DropdownOption[];
  total: number;
  message?: string;
}

/**
 * Convert model name from module.json to base model ID
 * Examples:
 * - "product.dropdown" -> "product"
 * - "product.list" -> "product"
 * - "product-category.dropdown" -> "product-category"
 * - "product" -> "product"
 */
function getBaseModelId(modelId: string): string {
  if (modelId.endsWith(".list")) {
    return modelId.slice(0, -".list".length);
  }
  if (modelId.endsWith(".dropdown")) {
    return modelId.slice(0, -".dropdown".length);
  }
  return modelId;
}

class DropdownOptionsService extends JsonRpcClientService {
  constructor() {
    super("/api/base/internal/json-rpc");
  }

  /**
   * Get dropdown options using JSON-RPC
   * Format: <base-model-id>.dropdown.getData
   *
   * @param model - Model name from module.json (e.g., "product.dropdown", "product")
   *                Will automatically convert to base model ID and use dropdown sub-type
   * @param params - Query parameters
   */
  getOptionsDropdown = async (
    model: string,
    params?: DropdownOptionsParams
  ): Promise<DropdownOptionsResponse> => {
    // Convert model name to base model ID
    // Example: "product.dropdown" -> "product"
    const baseModelId = getBaseModelId(model);

    // Use new format: <base-model-id>.dropdown.getData
    const method = `${baseModelId}.dropdown.getData`;

    const result = await this.call<DropdownOptionsResponse>(
      method,
      params ?? {}
    );
    return result;
  };
}

export default DropdownOptionsService;
export const dropdownOptionsService = new DropdownOptionsService();
