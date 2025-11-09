import ClientHttpService from "@base/client/services/ClientHttpService";

class ProductService extends ClientHttpService {
  constructor() {
    const BASE_URL = "/api/modules/product";
    super(BASE_URL);
  }

  async getProductList(params: any) {
    // POST to fetch list of products
    return this.post<{ success: boolean; data: any[] }>(`/`, params);
  }

  async getProductById(id: string) {
    // GET to fetch product by ID
    return this.get<{ success: boolean; data: any }>(`/${id}`);
  }
}

export default new ProductService();
