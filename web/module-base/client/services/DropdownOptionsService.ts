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
 * Service to get dropdown options using JSON-RPC
 * Format: <base-model-id>.dropdown.getData
 *
 * @param model - Model name from module.json (e.g., "product.dropdown", "product")
 *                Will automatically convert to base model ID and use dropdown sub-type
 * @param params - Query parameters
 */
class DropdownOptionsService extends JsonRpcClientService {
  private getBaseModelId(modelId: string): string {
    return modelId.endsWith(".dropdown") ? modelId : `${modelId}.dropdown`;
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
    params?: DropdownOptionsParams,
  ): Promise<DropdownOptionsResponse> => {
    // Convert model name to base model ID
    // Example: "product.dropdown" -> "product"
    const baseModelId = this.getBaseModelId(model);

    // Use new format: <base-model-id>.dropdown.getData
    const method = `${baseModelId}.getData`;

    const result = await this.call<DropdownOptionsResponse>(
      method,
      params ?? {},
    );

    return result;
  };
}

export default DropdownOptionsService;
export const dropdownOptionsService = new DropdownOptionsService();
