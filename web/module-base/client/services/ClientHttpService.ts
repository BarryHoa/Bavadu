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

  async get<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(this.getFullUrl(url), {
      ...options,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
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
    const response = await fetch(this.getFullUrl(url), {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
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
    const response = await fetch(this.getFullUrl(url), {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(
        `HTTP PUT error: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }

  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(this.getFullUrl(url), {
      ...options,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
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
