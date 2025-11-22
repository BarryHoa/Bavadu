import ClientHttpService from "./ClientHttpService";

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

class NewsService extends ClientHttpService {
  constructor() {
    const BASE_URL = "/api/base/news";
    super(BASE_URL);
  }

  /**
   * Get list of news with pagination
   * @param limit - Number of items per page (default: 12)
   * @param offset - Number of items to skip (default: 0)
   * @returns News list with pagination info
   */
  async getList(limit: number = 12, offset: number = 0): Promise<NewsListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("limit", limit.toString());
    searchParams.set("offset", offset.toString());

    const response = await this.get<NewsListResponse>(
      `?${searchParams.toString()}`
    );

    return response;
  }
}

const newsService = new NewsService();
export default newsService;

