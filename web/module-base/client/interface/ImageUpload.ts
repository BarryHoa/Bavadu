export type ImageUploadItemStatus = "idle" | "uploading" | "done" | "error";
export type ImageUploadItem = {
  uid: string;
  id?: string; // id from upload service
  name: string;
  size: number;
  extension: string;
  blob?: Blob;
  url?: string;
  status?: ImageUploadItemStatus;
};
