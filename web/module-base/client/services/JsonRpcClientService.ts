import ClientHttpService from "./ClientHttpService";

export interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params?: any;
  id?: string | number | null;
}

export interface JsonRpcResponse<T = any> {
  jsonrpc: string;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id?: string | number | null;
}

export class JsonRpcError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = "JsonRpcError";
  }
}

export class JsonRpcClientService extends ClientHttpService {
  private requestIdCounter = 0;
  private readonly rpc_version = "2.0";

  constructor(baseUrl: string = "/api/base/internal/json-rpc") {
    super(baseUrl);
  }

  private generateId(): number {
    return ++this.requestIdCounter;
  }

  /**
   * Call a single JSON-RPC method
   * Tận dụng ClientHttpService để xử lý CSRF và headers
   */
  async call<T = any>(
    method: string,
    params?: any,
    options?: { notification?: boolean }
  ): Promise<T> {
    const request: JsonRpcRequest = {
      jsonrpc: this.rpc_version,
      method,
      params,
      id: options?.notification ? null : this.generateId(),
    };

    // Sử dụng post method từ ClientHttpService
    const response = await this.post<JsonRpcResponse<T>>("", request);

    if (response.error) {
      throw new JsonRpcError(
        response.error.code,
        response.error.message,
        response.error.data
      );
    }

    return response.result as T;
  }

  /**
   * Call multiple methods in batch
   */
  async batch<T extends any[]>(
    calls: Array<{ method: string; params?: any }>
  ): Promise<T> {
    const requests: JsonRpcRequest[] = calls.map((call) => ({
      jsonrpc: this.rpc_version,
      method: call.method,
      params: call.params,
      id: this.generateId(),
    }));

    const responses = await this.post<JsonRpcResponse[]>("", requests);

    responses.sort((a, b) => {
      const idA = typeof a.id === "number" ? a.id : 0;
      const idB = typeof b.id === "number" ? b.id : 0;
      return idA - idB;
    });

    return responses.map((rpcResponse) => {
      if (rpcResponse.error) {
        throw new JsonRpcError(
          rpcResponse.error.code,
          rpcResponse.error.message,
          rpcResponse.error.data
        );
      }
      return rpcResponse.result;
    }) as T;
  }

  /**
   * Send a notification (no response expected)
   */
  async notify(method: string, params?: any): Promise<void> {
    await this.call(method, params, { notification: true });
  }
}

export default JsonRpcClientService;
