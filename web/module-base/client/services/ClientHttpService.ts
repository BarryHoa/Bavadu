import { getCsrfToken, getHeadersWithCsrf } from "../utils/csrf";

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

  private async getHeadersWithCsrf(options?: RequestInit): Promise<HeadersInit> {
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

  async get<T>(url: string, options?: RequestInit): Promise<T> {
    const headers = await this.getHeadersWithCsrf(options);
    const response = await fetch(this.getFullUrl(url), {
      ...options,
      method: "GET",
      headers,
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(
        `HTTP GET error: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }

  async post<T>(
    url: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    const headers = await this.getHeadersWithCsrf(options);
    const response = await fetch(this.getFullUrl(url), {
      ...options,
      method: "POST",
      headers,
      credentials: "include",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(
        `HTTP POST error: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }

  async put<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
    const headers = await this.getHeadersWithCsrf(options);
    const response = await fetch(this.getFullUrl(url), {
      ...options,
      method: "PUT",
      headers,
      credentials: "include",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(
        `HTTP PUT error: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }

  async patch<T>(
    url: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    const headers = await this.getHeadersWithCsrf(options);
    const response = await fetch(this.getFullUrl(url), {
      ...options,
      method: "PATCH",
      headers,
      credentials: "include",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(
        `HTTP PATCH error: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }

  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    const headers = await this.getHeadersWithCsrf(options);
    const response = await fetch(this.getFullUrl(url), {
      ...options,
      method: "DELETE",
      headers,
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(
        `HTTP DELETE error: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }
}

export default ClientHttpService;
