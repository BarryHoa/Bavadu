import type { ImageUploadItem } from "../interface/ImageUpload";

import ClientHttpService from "./ClientHttpService";

export interface UploadResponse {
  data: {
    id: string;
    filename: string;
    originalName: string;
    path: string;
    url: string;
    size: number;
    mimeType: string;
    type: "image" | "file";
  };
  message: string;
  status: number;
}

class MediaService extends ClientHttpService {
  constructor() {
    super("/api/base");
  }

  /**
   * Upload a file
   */
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();

    formData.append("file", file);

    // Get CSRF token for POST request
    const { getHeadersWithCsrf } = await import("../utils/csrf");
    const headers = await getHeadersWithCsrf();

    const response = await fetch("/api/base/media/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: {
        // Don't set Content-Type for FormData, browser will set it with boundary
        ...Object.fromEntries(
          Object.entries(headers).filter(
            ([key]) => key.toLowerCase() !== "content-type"
          )
        ),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(
        errorData.message ||
          errorData.error ||
          `Upload failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[]): Promise<UploadResponse[]> {
    return Promise.all(files.map((file) => this.uploadFile(file)));
  }

  /**
   * Upload image items that have blob but not yet uploaded
   */
  async uploadImageItems(items: ImageUploadItem[]): Promise<ImageUploadItem[]> {
    const itemsToUpload = items.filter(
      (item) => item.blob && item.status !== "done"
    );

    if (itemsToUpload.length === 0) {
      return items;
    }

    const uploadPromises = itemsToUpload.map(async (item) => {
      if (!item.blob) return item;

      try {
        const file = new File([item.blob], item.name, {
          type: `image/${item.extension.replace(".", "")}`,
        });
        const result = await this.uploadFile(file);

        return {
          ...item,
          id: result.data.id,
          url: result.data.url,
          status: "done" as const,
          blob: undefined, // Remove blob after upload
        };
      } catch (error) {
        console.error("Error uploading image:", error);

        return {
          ...item,
          status: "error" as const,
        };
      }
    });

    const uploadedItems = await Promise.all(uploadPromises);

    // Replace items in original array
    return items.map((item) => {
      const uploaded = uploadedItems.find((u) => u.uid === item.uid);

      return uploaded || item;
    });
  }
}

export default new MediaService();
