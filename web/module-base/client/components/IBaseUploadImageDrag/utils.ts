import { uuidv7 } from "uuidv7";
import type { ImageUploadItem } from "../../interface/ImageUpdload";

/**
 * Normalize image upload items
 * Convert values to ImageUploadItem format
 * Use it for the first time mount the component or after upload service change
 */
export const normalizeItems = (items: ImageUploadItem[]): ImageUploadItem[] => {
  return items.map((item) => {
    const uid = item.uid || uuidv7();
    let status = item.status;
    // override status if url is present
    if (item.url) {
      status = "done";
    }
    // override status if status is present
    if (item.blob && !status) {
      status = "idle";
    }
    return {
      uid,
      name: item.name,
      size: item.size,
      extension: item.extension,
      url: item.url,
      blob: item.blob,
      status,
    } as ImageUploadItem;
  });
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
};

/**
 * Validate file against accept types and max size
 */
export const validateFile = (
  file: File,
  accept: string,
  maxSize: number
): { valid: boolean; type?: string; error?: string } => {
  // Check file type
  const acceptedTypes = accept.split(",").map((t) => t.trim());
  if (!acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      type: "FILE_TYPE_NOT_ALLOWED",
      error: `File type not allowed. Accepted types: ${accept}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      type: "FILE_SIZE_EXCEEDS_MAXIMUM_ALLOWED_SIZE",
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
};
