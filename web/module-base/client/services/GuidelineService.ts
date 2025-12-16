import JsonRpcClientService from "./JsonRpcClientService";

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

class GuidelineService extends JsonRpcClientService {
  /**
   * Get guideline by key
   * @param key - Guideline key
   * @returns Guideline content
   */
  async getByKey(key: string): Promise<string> {
    const response = await this.call<GuidelineResponse>(
      "guideline.curd.getByKey",
      { key },
    );

    return response.data?.content || "";
  }

  /**
   * Get full guideline data by key
   * @param key - Guideline key
   * @returns Full guideline data including metadata
   */
  async getByKeyFull(key: string): Promise<GuidelineData | null> {
    const response = await this.call<GuidelineResponse>(
      "guideline.curd.getByKey",
      { key },
    );

    return response.data || null;
  }
}

const guidelineService = new GuidelineService();

export default guidelineService;
