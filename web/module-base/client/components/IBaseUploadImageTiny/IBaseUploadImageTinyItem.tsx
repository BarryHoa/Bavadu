"use client";

import { AlertCircle, Image as ImageIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef, useState } from "react";

import { ImageUploadItem } from "../../interface/ImageUpdload";

type IBaseUploadImageTinyItemProps = {
  item: ImageUploadItem;
  isUploading: boolean;
  isDisabled: boolean;
  onRemove: () => void;
};

const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function IBaseUploadImageTinyItem({
  item,
  isUploading,
  isDisabled,
  onRemove,
}: IBaseUploadImageTinyItemProps) {
  const t = useTranslations("components.uploadImage");
  const [imageError, setImageError] = useState(false);
  const base64SrcRef = useRef<string | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const loadingRef = useRef(false);
  const [, forceUpdate] = useState(0);

  // Convert blob to base64 when blob changes (without useEffect)
  if (item.blob && item.blob !== blobRef.current && !loadingRef.current) {
    blobRef.current = item.blob;
    loadingRef.current = true;
    convertBlobToBase64(item.blob)
      .then((base64) => {
        base64SrcRef.current = base64;
        setImageError(false);
        loadingRef.current = false;
        forceUpdate((prev) => prev + 1);
      })
      .catch(() => {
        setImageError(true);
        base64SrcRef.current = null;
        loadingRef.current = false;
        forceUpdate((prev) => prev + 1);
      });
  } else if (!item.blob && blobRef.current) {
    blobRef.current = null;
    base64SrcRef.current = null;
    setImageError(false);
    loadingRef.current = false;
  }

  // Priority: blob (base64) > url > id
  const src =
    base64SrcRef.current ||
    item.url ||
    (item.id ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${item.id}` : null);

  const hasError = imageError || item.status === "error";
  const isUploadingStatus = item.status === "uploading" || isUploading;

  // Get border color based on status
  const getBorderClass = () => {
    if (hasError) return "border-2 border-danger";
    if (item.status === "done") return "border-2 border-success";
    if (isUploadingStatus) return "border-2 border-warning";

    return "";
  };

  return (
    <div className="relative group">
      {/* Gradient border wrapper for uploading status */}
      {isUploadingStatus ? (
        <div
          className="relative w-20 h-20 rounded-lg p-[2px] animate-spin-slow"
          style={{
            background: `conic-gradient(from 0deg, #F5A524, #F7BF33, #F9CF66, #F5A524)`,
          }}
        >
          <div className="relative w-full h-full rounded-lg overflow-hidden bg-default-100">
            {imageError ? (
              <div className="w-full h-full flex items-center justify-center">
                <AlertCircle className="text-danger" size={16} />
              </div>
            ) : src ? (
              <Image
                fill
                alt={item.name}
                className="object-cover"
                src={src}
                onError={() => {
                  setImageError(true);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="text-default-400" size={16} />
              </div>
            )}

            {/* Uploading overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-[10px]">...</div>
              </div>
            )}

            {/* Remove button */}
            {!isDisabled && !isUploading && (
              <button
                aria-label={t("removeImage")}
                className="absolute top-0.5 right-0.5 p-0.5 bg-danger text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <X size={10} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`relative w-20 h-20 rounded-lg overflow-hidden bg-default-100 ${getBorderClass()}`}
        >
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center">
              <AlertCircle className="text-danger" size={16} />
            </div>
          ) : src ? (
            <Image
              fill
              alt={item.name}
              className="object-cover"
              src={src}
              onError={() => {
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center ">
              <ImageIcon className="text-default-400 " size={16} />
            </div>
          )}

          {/* Uploading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white text-[10px]">...</div>
            </div>
          )}

          {/* Error overlay - only show for upload errors, not image load errors */}
          {item.status === "error" && !imageError && (
            <div className="absolute inset-0 bg-danger/50 flex items-center justify-center">
              <div className="text-white text-[10px] text-center px-1">
                Error
              </div>
            </div>
          )}

          {/* Remove button */}
          {!isDisabled && !isUploading && (
            <button
              aria-label="Remove image"
              className=" cursor-pointer absolute top-0.5 right-0.5 p-0.5 bg-danger text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X size={10} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
