import ClientHttpService from "./ClientHttpService";

export interface GuidelineData {
  key: string;
  content: string;
  updatedAt: string;
}

export interface GuidelineResponse {
  success: boolean;
  data: GuidelineData;
  message?: string;
}

class GuidelineService extends ClientHttpService {
  constructor() {
    const BASE_URL = "/api/base/guideline";
    super(BASE_URL);
  }

  /**
   * Get guideline by key
   * @param key - Guideline key
   * @returns Guideline content
   */
  async getByKey(key: string): Promise<string> {
    const searchParams = new URLSearchParams();
    searchParams.set("key", key);

    const response = await this.get<GuidelineResponse>(
      `/get-by-key?${searchParams.toString()}`
    );

    return response.data?.content || "";
  }

  /**
   * Get full guideline data by key
   * @param key - Guideline key
   * @returns Full guideline data including metadata
   */
  async getByKeyFull(key: string): Promise<GuidelineData | null> {
    const searchParams = new URLSearchParams();
    searchParams.set("key", key);

    const response = await this.get<GuidelineResponse>(
      `/get-by-key?${searchParams.toString()}`
    );

    return response.data || null;
  }
}

const guidelineService = new GuidelineService();
export default guidelineService;

