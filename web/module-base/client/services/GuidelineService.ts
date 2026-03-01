import JsonRpcClientService from "./JsonRpcClientService";

export interface GuidelineData {
  key: string;
  content: string;
  updatedAt: string;
}

class GuidelineService extends JsonRpcClientService {
  /**
   * Get guideline by key (JSON-RPC result is GuidelineData | null)
   * @param key - Guideline key
   * @returns Guideline content
   */
  async getByKey(key: string): Promise<string> {
    const result = await this.call<GuidelineData | null>(
      "base-guideline.curd.getByKey",
      { key },
    );
    return result?.content ?? "";
  }

  /**
   * Get full guideline data by key
   * @param key - Guideline key
   * @returns Full guideline data including metadata
   */
  async getByKeyFull(key: string): Promise<GuidelineData | null> {
    const result = await this.call<GuidelineData | null>(
      "base-guideline.curd.getByKey",
      { key },
    );
    return result ?? null;
  }
}

const guidelineService = new GuidelineService();

export default guidelineService;
