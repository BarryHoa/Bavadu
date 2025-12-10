"use client";

import { Card, CardBody } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { chunk } from "lodash";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { ImageUploadItem } from "../../interface/ImageUpdload";
import ImageUploadItemComponent from "./IBaseUploadImageDragItem";
import { getFileExtension, normalizeItems, validateFile } from "./utils";

type IBaseUploadImageDragProps = {
  accept?: string;
  maxSize?: number; // in bytes, default 5MB
  maxCount?: number; // maximum number of images
  values?: ImageUploadItem[];
  onChange?: (items: ImageUploadItem[]) => void;
  uploadService?: (file: File) => Promise<{ id: string }>;
  isDisabled?: boolean;
  label?: string;
};

const DEFAULT_ACCEPT = "image/jpeg,image/jpg,image/png";
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_MAX_COUNT = 10;

export default function IBaseUploadImageDrag({
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  maxCount = DEFAULT_MAX_COUNT,
  values = [],
  onChange,
  uploadService,
  isDisabled = false,
  label,
}: IBaseUploadImageDragProps) {
  const t = useTranslations("components.uploadImage");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingItems, setUploadingItems] = useState<Set<string>>(new Set());

  // init items from values
  const [items, setItems] = useState<ImageUploadItem[]>(() => {
    if (!values || values.length === 0) return [];
    return normalizeItems(values as ImageUploadItem[]);
  });

  // Update items when values change
  const handleItemsChange = useCallback(
    (newItems: ImageUploadItem[]) => {
      setItems(newItems);
      onChange?.(newItems);
    },
    [onChange]
  );

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const remainingSlots = maxCount - items.length;

      if (fileArray.length > remainingSlots) {
        addToast({
          title: t("tooManyFiles"),
          description: t("tooManyFilesDescription", { count: remainingSlots }),
          color: "warning",
        });
        return;
      }

      // Validate all files first
      const validationResults = fileArray.map((file) => ({
        file,
        validation: validateFile(file, accept, maxSize),
      }));

      // Separate valid and invalid files
      const invalidFiles = validationResults.filter(
        (result) => !result.validation.valid
      );
      const validFiles = validationResults.filter(
        (result) => result.validation.valid
      );

      if (invalidFiles.length > 0) {
        const invalidNotAllowed = invalidFiles.find(
          (result) => result.validation.type === "FILE_TYPE_NOT_ALLOWED"
        );
        if (invalidNotAllowed) {
          addToast({
            title: t("invalidFile"),
            description: invalidNotAllowed.validation.error,
            color: "danger",
          });
        }
        const invalidFileSizeExceeded = invalidFiles.find(
          (result) =>
            result.validation.type === "FILE_SIZE_EXCEEDS_MAXIMUM_ALLOWED_SIZE"
        );
        if (invalidFileSizeExceeded) {
          addToast({
            title: t("invalidFile"),
            description: invalidFileSizeExceeded.validation.error,
            color: "danger",
          });
        }
      }

      if (validFiles.length === 0) {
        return;
      }

      // Create items from valid files (keep reference to original file for upload)
      const fileItemMap = new Map<string, File>();
      const newItems: ImageUploadItem[] = validFiles.map(({ file }) => {
        const extension = getFileExtension(file.name);
        const uid = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        fileItemMap.set(uid, file);

        return {
          uid,
          name: file.name,
          size: file.size,
          extension,
          blob: file,
          status: "idle",
        } as ImageUploadItem;
      });

      // If no upload service, add items immediately
      if (!uploadService) {
        handleItemsChange([...items, ...newItems]);
        return;
      }

      // // Add all items with "idle" status first
      // const allItems = [...items, ...newItems];
      // handleItemsChange(allItems);

      // Upload files in chunks of 5
      const CHUNK_SIZE = 5;
      const chunks = chunk(newItems, CHUNK_SIZE);

      // Upload each chunk sequentially
      for (const chunk of chunks) {
        // Mark items as uploading
        const chunkUids = chunk.map((item) => item.uid);
        setUploadingItems((prev) => {
          const next = new Set(prev);
          chunkUids.forEach((uid) => next.add(uid));
          return next;
        });

        // Update status to uploading for current items
        setItems((currentItems) => {
          const updated = currentItems.map((item) => {
            if (chunkUids.includes(item.uid)) {
              return { ...item, status: "uploading" as const };
            }
            return item;
          });
          handleItemsChange(updated);
          return updated;
        });

        // Upload chunk in parallel
        const uploadPromises = chunk.map(async (item) => {
          const file = fileItemMap.get(item.uid);
          if (!file) {
            return {
              uid: item.uid,
              success: false,
              error: "File not found",
            };
          }

          try {
            const result = await uploadService(file);
            return {
              uid: item.uid,
              id: result.id,
              success: true,
            };
          } catch (error) {
            return {
              uid: item.uid,
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to upload image",
            };
          }
        });

        const uploadResults = await Promise.all(uploadPromises);

        // Update items based on upload results

        const updatedItems = uploadResults.map((result) => {
          return {
            ...result,
            status: result.success ? ("done" as const) : ("error" as const),
          };
        });
        handleItemsChange([...items, ...updatedItems] as ImageUploadItem[]);
        setItems([...items, ...updatedItems] as ImageUploadItem[]);
        setUploadingItems(new Set());
      }
    },
    [items, maxCount, accept, maxSize, uploadService, handleItemsChange]
  );

  const handleRemove = useCallback(
    (uid: string) => {
      const newItems = items.filter((item) => item.uid !== uid);
      handleItemsChange(newItems);
    },
    [items, handleItemsChange]
  );

  const canAddMore = items.length < maxCount;
  const isUploadDisabled = isDisabled || !canAddMore;

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (isUploadDisabled) return;

      const files = e.dataTransfer.files;
      handleFileSelect(files);
    },
    [isUploadDisabled, handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleClick = useCallback(() => {
    if (!isUploadDisabled) {
      fileInputRef.current?.click();
    }
  }, [isUploadDisabled]);

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
          isUploadDisabled
            ? "border-default-200 bg-default-50 cursor-not-allowed"
            : "border-default-300 hover:border-primary-400 cursor-pointer bg-default-50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          disabled={isUploadDisabled}
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <Upload
            size={32}
            className={`${isUploadDisabled ? "text-default-300" : "text-default-400"}`}
          />
          <p
            className={`text-sm text-center ${isUploadDisabled ? "text-default-400" : "text-default-500"}`}
          >
            {canAddMore
              ? t("clickOrDrag")
              : t("maxReached", { count: maxCount })}
          </p>
          {canAddMore && (
            <p className="text-xs text-default-400 text-center">
              {t("accepted", {
                types: accept.replace(/image\//g, "").replace(/,/g, ", "),
              })}{" "}
              {t("maxSize", { size: (maxSize / (1024 * 1024)).toFixed(0) })}
            </p>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-2">
          {items.map((item) => (
            <Card key={item.uid}>
              <CardBody className="p-2">
                <ImageUploadItemComponent
                  item={item}
                  isUploading={uploadingItems.has(item.uid)}
                  isDisabled={isDisabled}
                  onRemove={() => handleRemove(item.uid)}
                />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
