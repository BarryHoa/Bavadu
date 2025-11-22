import { getHeadersWithCsrf } from "../utils/csrf";

class ClientHttpService {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  private getFullUrl(url: string) {
    if (!this.baseUrl) return url;
    // Avoid double slashes
    return `${this.baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
  }

  private async getHeadersWithCsrf(
    options?: RequestInit
  ): Promise<HeadersInit> {
    const safeMethods = ["GET", "HEAD", "OPTIONS"];
    const method = (options?.method || "GET").toUpperCase();

    // Only add CSRF token for state-changing methods
    if (safeMethods.includes(method)) {
      return {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      };
    }

    // For POST, PUT, PATCH, DELETE - add CSRF token
    return getHeadersWithCsrf(options?.headers);
  }

  /**
   * Generic method to send HTTP requests
   * @param url - Request URL
   * @param method - HTTP method (GET, POST, PUT, PATCH, DELETE)
   * @param data - Optional request body data
   * @param options - Optional fetch options
   * @returns Promise with parsed JSON response
   */
  private async send<T>(
    url: string,
    method: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    const requestInit: RequestInit = {
      ...options,
      method,
    };

    const headers = await this.getHeadersWithCsrf(requestInit);
    const response = await fetch(this.getFullUrl(url), {
      ...requestInit,
      headers,
      credentials: "include",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(
        `HTTP ${method} error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async get<T>(url: string, options?: RequestInit): Promise<T> {
    return this.send<T>(url, "GET", undefined, options);
  }

  async post<T>(
    url: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.send<T>(url, "POST", data, options);
  }

  async put<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.send<T>(url, "PUT", data, options);
  }

  async patch<T>(
    url: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.send<T>(url, "PATCH", data, options);
  }

  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    return this.send<T>(url, "DELETE", undefined, options);
  }
}

export default ClientHttpService;
