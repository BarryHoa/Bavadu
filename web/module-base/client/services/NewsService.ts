import JsonRpcClientService from "./JsonRpcClientService";

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary?: string;
  authorId: string;
  authorName?: string;
  isPublished: boolean;
  publishedAt?: string;
  imageUrl?: string;
  tags?: string[];
  viewCount: string;
  createdAt: string;
}

export interface NewsListResponse {
  success: boolean;
  data: NewsItem[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  message?: string;
}

class NewsService extends JsonRpcClientService {
  /**
   * Get list of news with pagination
   * @param limit - Number of items per page (default: 12)
   * @param offset - Number of items to skip (default: 0)
   * @returns News list with pagination info
   */
  async getList(
    limit: number = 12,
    offset: number = 0
  ): Promise<NewsListResponse> {
    return this.call<NewsListResponse>("news.curd.getList", {
      limit,
      offset,
    });
  }
}

const newsService = new NewsService();
export default newsService;
