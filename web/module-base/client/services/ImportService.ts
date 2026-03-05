import JsonRpcClientService from "./JsonRpcClientService";

export interface RowError {
  row: number;
  message: string;
  field?: string;
}

export interface ImportResult {
  totalRows: number;
  processed: number;
  successCount: number;
  errorCount: number;
  errors: RowError[];
}

export interface ImportProgressData {
  processed: number;
  total: number;
  status: string;
  result?: ImportResult;
  errorMessage?: string;
  errors?: RowError[];
}

const RPC_METHOD_GET_TEMPLATE = "base-import.curd.getTemplate";
const UPLOAD_URL = "/api/base/import/upload";
const PROGRESS_URL = "/api/base/import/progress";

class ImportService extends JsonRpcClientService {
  /**
   * Get template file as base64 and fileName (requires base.import.import permission).
   */
  async getTemplate(key: string): Promise<{ fileName: string; base64: string }> {
    return this.call<{ fileName: string; base64: string }>(
      RPC_METHOD_GET_TEMPLATE,
      { key },
    );
  }

  /**
   * Upload file and watch progress via SSE. Returns final ImportResult when done.
   * Requires base.import.import permission.
   */
  async uploadAndWatchProgress(
    key: string,
    file: File,
    onProgress: (data: ImportProgressData) => void,
  ): Promise<ImportResult> {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("key", key);

    const { getHeadersWithCsrf: getCsrf } = await import("../utils/csrf");
    const headers = await getCsrf();

    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: {
        ...Object.fromEntries(
          Object.entries(headers).filter(
            ([k]) => k.toLowerCase() !== "content-type",
          ),
        ),
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));

      throw new Error(
        err.message || err.error || `Upload failed: ${response.status}`,
      );
    }

    const body = (await response.json()) as { jobId?: string };
    const jobId = body.jobId;

    if (!jobId) {
      throw new Error("Server did not return jobId");
    }

    return new Promise<ImportResult>((resolve, reject) => {
      const url = `${PROGRESS_URL}?jobId=${encodeURIComponent(jobId)}`;
      const eventSource = new EventSource(url, { withCredentials: true });

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as ImportProgressData & {
            status: string;
            result?: ImportResult;
            errorMessage?: string;
          };

          onProgress({
            processed: data.processed ?? 0,
            total: data.total ?? 0,
            status: data.status ?? "processing",
            result: data.result,
            errorMessage: data.errorMessage,
            errors: data.errors,
          });

          if (data.status === "done") {
            eventSource.close();

            if (data.result) {
              resolve(data.result);
            } else {
              resolve({
                totalRows: 0,
                processed: 0,
                successCount: 0,
                errorCount: 0,
                errors: [],
              });
            }
          } else if (data.status === "error") {
            eventSource.close();
            reject(
              new Error(
                data.errorMessage || "Import failed",
              ),
            );
          }
        } catch (e) {
          eventSource.close();
          reject(e);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        reject(new Error("Progress connection failed"));
      };
    });
  }
}

export const importService = new ImportService();
export default importService;
