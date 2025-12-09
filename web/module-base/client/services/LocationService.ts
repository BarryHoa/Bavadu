import JsonRpcClientService from "./JsonRpcClientService";

interface AdministrativeUnit {
  id: string;
  countryId: string;
  code?: string | null;
  name: Record<string, string>; // LocalizeText
  type: string;
  level: number;
  parentId?: string | null;
  isActive: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

interface Country {
  id: string;
  code: string;
  name: Record<string, string>; // LocalizeText
  isActive: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

class LocationService extends JsonRpcClientService {
  async getCountries() {
    return this.call<{ success: boolean; data: Country[]; message: string }>(
      "location.curd.getCountries",
      {}
    );
  }

  async getLocationByCountryCode(
    countryCode: string,
    params?: {
      parentId?: string | null;
      level?: number;
    }
  ) {
    return this.call<{
      success: boolean;
      data: AdministrativeUnit[];
      message: string;
    }>("location.curd.getLocationByCountryCode", {
      countryCode,
      ...params,
    });
  }

  async getLocationBy(parentId: string, type: string) {
    return this.call<{
      success: boolean;
      data: AdministrativeUnit[];
      message: string;
    }>("location.curd.getLocationBy", {
      parentId,
      type,
    });
  }
}

const locationService = new LocationService();
export default locationService;
