import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export interface UploadResult {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
  type: "image" | "file";
}

// Allowed file extensions
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const ALLOWED_FILE_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".txt",
  ".csv",
];

// Allowed MIME types
const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_FILE_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];

// Maximum file size: 10MB (from env or default)
const MAX_FILE_SIZE =
  parseInt(process.env.MAX_FILE_SIZE || "10485760", 10) || 10485760;

class MediaServiceModel {
  private readonly storageDir: string;
  private readonly imageDir: string;
  private readonly fileDir: string;

  constructor() {
    // Get storage directory from env or use default
    const rootDir = process.cwd();
    this.storageDir = path.join(rootDir, "storage");
    this.imageDir = path.join(this.storageDir, "image");
    this.fileDir = path.join(this.storageDir, "file");

    // Ensure directories exist
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      await fs.mkdir(this.imageDir, { recursive: true });
      await fs.mkdir(this.fileDir, { recursive: true });
    } catch (error) {
      console.error("Error creating storage directories:", error);
    }
  }

  /**
   * Check if a file is an image based on MIME type
   */
  private isImage(mimeType: string): boolean {
    return mimeType.startsWith("image/");
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  /**
   * Sanitize filename to prevent path traversal
   */
  private sanitizeFilename(filename: string): string {
    // Remove path separators and dangerous characters
    return filename
      .replace(/[\/\\]/g, "")
      .replace(/\.\./g, "")
      .replace(/[<>:"|?*]/g, "")
      .trim();
  }

  /**
   * Validate file extension against allowed list
   */
  private validateExtension(extension: string, isImage: boolean): boolean {
    const allowedExtensions = isImage
      ? ALLOWED_IMAGE_EXTENSIONS
      : ALLOWED_FILE_EXTENSIONS;
    return allowedExtensions.includes(extension);
  }

  /**
   * Validate MIME type against allowed list
   */
  private validateMimeType(mimeType: string, isImage: boolean): boolean {
    const allowedMimeTypes = isImage
      ? ALLOWED_IMAGE_MIME_TYPES
      : ALLOWED_FILE_MIME_TYPES;
    return allowedMimeTypes.includes(mimeType);
  }

  /**
   * Validate file size
   */
  private validateFileSize(size: number): boolean {
    return size > 0 && size <= MAX_FILE_SIZE;
  }

  /**
   * Upload a file to storage
   */
  upload = async (file: {
    name: string;
    size: number;
    type: string;
    arrayBuffer: () => Promise<ArrayBuffer>;
  }): Promise<UploadResult> => {
    try {
      // 1. Validate file size
      if (!this.validateFileSize(file.size)) {
        throw new Error(
          `File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes (${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB)`
        );
      }

      // 2. Sanitize original filename
      const sanitizedOriginalName = this.sanitizeFilename(file.name);

      // 3. Determine if it's an image or file
      const isImageFile = this.isImage(file.type);
      const targetDir = isImageFile ? this.imageDir : this.fileDir;
      const fileType: "image" | "file" = isImageFile ? "image" : "file";

      // 4. Get and validate file extension
      const fileExtension = this.getFileExtension(sanitizedOriginalName);
      if (!this.validateExtension(fileExtension, isImageFile)) {
        throw new Error(
          `File extension ${fileExtension} is not allowed for ${fileType} uploads`
        );
      }

      // 5. Validate MIME type
      if (!this.validateMimeType(file.type, isImageFile)) {
        throw new Error(
          `MIME type ${file.type} is not allowed for ${fileType} uploads`
        );
      }

      // 6. Generate unique filename (using UUID to prevent collisions and path traversal)
      const uniqueId = randomUUID();
      const filename = `${uniqueId}${fileExtension}`;

      // 7. Use path.join and resolve to prevent path traversal
      const filePath = path.resolve(targetDir, filename);

      // 8. Ensure the resolved path is still within the target directory
      const resolvedTargetDir = path.resolve(targetDir);
      if (!filePath.startsWith(resolvedTargetDir)) {
        throw new Error("Invalid file path detected");
      }

      // 9. Read file buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 10. Write file to disk
      await fs.writeFile(filePath, buffer);

      // 11. Generate URL path (relative to storage)
      const urlPath = `/api/base/media/${fileType}/${filename}`;

      return {
        id: uniqueId,
        filename,
        originalName: sanitizedOriginalName,
        path: filePath,
        url: urlPath,
        size: file.size,
        mimeType: file.type,
        type: fileType,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to upload file: Unknown error");
    }
  };

  /**
   * Get file by type and filename
   */
  getFile = async (
    type: "image" | "file",
    filename: string
  ): Promise<{ buffer: Buffer; mimeType: string; size: number } | null> => {
    try {
      // 1. Sanitize filename to prevent path traversal
      const sanitizedFilename = this.sanitizeFilename(filename);
      if (sanitizedFilename !== filename) {
        // Filename was modified, reject request
        return null;
      }

      // 2. Validate file extension
      const ext = this.getFileExtension(sanitizedFilename);
      const isImage = type === "image";
      if (!this.validateExtension(ext, isImage)) {
        return null;
      }

      // 3. Resolve paths to prevent path traversal
      const targetDir = type === "image" ? this.imageDir : this.fileDir;
      const resolvedTargetDir = path.resolve(targetDir);
      const filePath = path.resolve(targetDir, sanitizedFilename);

      // 4. Ensure the resolved path is still within the target directory
      if (!filePath.startsWith(resolvedTargetDir)) {
        console.error("Path traversal attempt detected:", filename);
        return null;
      }

      // 5. Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return null;
      }

      // 6. Read file
      const buffer = await fs.readFile(filePath);
      const stats = await fs.stat(filePath);

      // 7. Determine MIME type from file extension (whitelist only)
      const mimeTypes: Record<string, string> = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xls": "application/vnd.ms-excel",
        ".xlsx":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".txt": "text/plain",
        ".csv": "text/csv",
      };

      const mimeType = mimeTypes[ext] || "application/octet-stream";

      return {
        buffer,
        mimeType,
        size: stats.size,
      };
    } catch (error) {
      console.error("Error getting file:", error);
      return null;
    }
  };

  /**
   * Delete file by type and filename
   */
  deleteFile = async (
    type: "image" | "file",
    filename: string
  ): Promise<boolean> => {
    try {
      const targetDir = type === "image" ? this.imageDir : this.fileDir;
      const filePath = path.join(targetDir, filename);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return false;
      }

      // Delete file
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  };
}

// Singleton instance
let mediaServiceModelInstance: MediaServiceModel | null = null;

export const getMediaServiceModel = (): MediaServiceModel => {
  if (!mediaServiceModelInstance) {
    mediaServiceModelInstance = new MediaServiceModel();
  }
  return mediaServiceModelInstance;
};

export default MediaServiceModel;
