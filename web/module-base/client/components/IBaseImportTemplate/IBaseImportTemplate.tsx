"use client";

import React, { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Upload } from "lucide-react";

import {
  IBaseButton,
  IBaseModal,
  IBaseModalBody,
  IBaseModalContent,
  IBaseModalFooter,
  IBaseModalHeader,
  IBaseProgress,
} from "@base/client/components";
import { usePermission } from "@base/client/hooks/useHasPermissions";
import importService, {
  type ImportResult,
} from "@base/client/services/ImportService";

const DEFAULT_PERMISSION = "base.import.import";

export interface IBaseImportTemplateProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  templateKey: string;
  title?: string;
  requiredPermission?: string;
  onSuccess?: (result: ImportResult) => void;
  onError?: (error: Error) => void;
}

export function IBaseImportTemplate({
  isOpen,
  onOpenChange,
  templateKey,
  title,
  requiredPermission = DEFAULT_PERMISSION,
  onSuccess,
  onError,
}: IBaseImportTemplateProps): React.ReactNode {
  const t = useTranslations("common");
  const { hasPermission } = usePermission();
  const canImport = hasPermission(requiredPermission);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadTemplate = useCallback(async () => {
    if (!canImport) return;

    setError(null);

    try {
      const { fileName, base64 } = await importService.getTemplate(templateKey);
      const blob = new Blob(
        [Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))],
        {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      setError(message);
      onError?.(err instanceof Error ? err : new Error(message));
    }
  }, [canImport, templateKey, onError]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];

      setFile(f ?? null);
      setResult(null);
      setError(null);
    },
    [],
  );

  const handleUpload = useCallback(async () => {
    if (!canImport || !file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const res = await importService.uploadAndWatchProgress(
        templateKey,
        file,
        (data) => {
          setProcessed(data.processed);
          setTotal(data.total);
        },
      );

      setResult(res);
      onSuccess?.(res);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      setError(message);
      onError?.(err instanceof Error ? err : new Error(message));
    } finally {
      setUploading(false);
    }
  }, [canImport, file, templateKey, onSuccess, onError]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setFile(null);
    setUploading(false);
    setProcessed(0);
    setTotal(0);
    setResult(null);
    setError(null);
  }, [onOpenChange]);

  const modalTitle = title ?? "Import dữ liệu";

  return (
    <IBaseModal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <IBaseModalContent>
        <IBaseModalHeader className="flex flex-col gap-1">
          {modalTitle}
        </IBaseModalHeader>
        <IBaseModalBody>
          {!canImport ? (
            <p className="text-muted-foreground">
              Bạn không có quyền import. Liên hệ quản trị viên để được cấp quyền.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <IBaseButton
                  color="primary"
                  variant="bordered"
                  startContent={<Download size={16} />}
                  onPress={handleDownloadTemplate}
                >
                  Tải template mẫu
                </IBaseButton>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Chọn file (.xlsx)</label>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:text-primary-foreground file:transition-colors"
                />
                <IBaseButton
                  color="primary"
                  onPress={handleUpload}
                  isDisabled={!file || uploading}
                  startContent={<Upload size={16} />}
                  isLoading={uploading}
                >
                  Upload
                </IBaseButton>
              </div>

              {uploading && total > 0 && (
                <div className="space-y-1">
                  <IBaseProgress
                    value={total ? Math.round((processed / total) * 100) : 0}
                    size="sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {processed} / {total}
                  </p>
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {result && !uploading && (
                <div className="rounded-md border p-3 text-sm">
                  <p>
                    Đã xử lý: {result.processed} / {result.totalRows}
                  </p>
                  <p>Thành công: {result.successCount}</p>
                  {result.errorCount > 0 && (
                    <p className="text-destructive">Lỗi: {result.errorCount}</p>
                  )}
                  {result.errors.length > 0 && (
                    <ul className="mt-2 list-inside list-disc text-muted-foreground">
                      {result.errors.slice(0, 5).map((e, i) => (
                        <li key={i}>
                          Dòng {e.row}: {e.message}
                        </li>
                      ))}
                      {result.errors.length > 5 && (
                        <li>... và {result.errors.length - 5} lỗi khác</li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </IBaseModalBody>
        <IBaseModalFooter>
          <IBaseButton variant="flat" onPress={handleClose}>
            Đóng
          </IBaseButton>
        </IBaseModalFooter>
      </IBaseModalContent>
    </IBaseModal>
  );
}
