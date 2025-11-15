import ClientHttpService from "./ClientHttpService";

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

class LocationService extends ClientHttpService {
  constructor() {
    const BASE_URL = "/api/base/location";
    super(BASE_URL);
  }

  async getCountries() {
    return this.get<{ success: boolean; data: Country[]; message: string }>(
      "/countries"
    );
  }

  async getLocationByCountryCode(
    countryCode: string,
    params?: {
      parentId?: string | null;
      level?: number;
    }
  ) {
    const searchParams = new URLSearchParams();
    searchParams.set("countryCode", countryCode);
    if (params?.parentId !== undefined) {
      searchParams.set("parentId", params.parentId || "");
    }
    if (params?.level) {
      searchParams.set("level", params.level.toString());
    }

    return this.get<{
      success: boolean;
      data: AdministrativeUnit[];
      message: string;
    }>(`/by-country-code?${searchParams.toString()}`);
  }

  async getLocationBy(parentId: string, type: string) {
    const searchParams = new URLSearchParams();
    searchParams.set("parentId", parentId);
    searchParams.set("type", type);

    return this.get<{
      success: boolean;
      data: AdministrativeUnit[];
      message: string;
    }>(`/by?${searchParams.toString()}`);
  }
}

const locationService = new LocationService();
export default locationService;
