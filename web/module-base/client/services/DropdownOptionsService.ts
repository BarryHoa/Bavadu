import ClientHttpService from "./ClientHttpService";

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

class DropdownOptionsService extends ClientHttpService {
  constructor() {
    super("/api/base/dropdown-options");
  }

  getOptionsDropdown = async (
    model: string,
    params?: DropdownOptionsParams
  ): Promise<DropdownOptionsResponse> => {
    const response = await this.post<{
      status: number;
      data: DropdownOptionsResponse;
      message?: string;
    }>("/", {
      model,
      params: params ?? {},
    });
    return response.data;
  };
}

export default DropdownOptionsService;
export const dropdownOptionsService = new DropdownOptionsService();

