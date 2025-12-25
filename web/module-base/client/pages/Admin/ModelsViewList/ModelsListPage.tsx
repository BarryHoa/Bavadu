"use client";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseInput,
} from "@base/client/components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MiniSearch from "minisearch";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IBaseTable,
  IBaseTableColumnDefinition,
} from "@base/client/components/IBaseTable";
import { useTranslations } from "next-intl";

import adminModelService, {
  type ModelRow,
  type ReloadModelRequest,
  type ReloadModelResponse,
} from "./services/AdminModelService";

const MODEL_LIST_QUERY_KEY = ["admin", "models", "list"] as const;

export default function ModelsListPage() {
  const t = useTranslations("admin.models");
  const actionsT = useTranslations("common.actions");
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "error" | "success" = "error") => {
      setToast({ message, type });
    },
    [],
  );

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast]);

  const modelListQuery = useQuery<ModelRow[], Error>({
    queryKey: MODEL_LIST_QUERY_KEY,
    queryFn: async () => {
      const response = await adminModelService.getModelList();

      return response.data;
    },
  });

  const reloadModelMutation = useMutation<
    ReloadModelResponse,
    Error,
    ReloadModelRequest
  >({
    mutationFn: (payload: ReloadModelRequest) =>
      adminModelService.reloadModel(payload),
    onSuccess: (data, variables) => {
      if (!data.success) {
        const errorMessage =
          data.message || t("toast.reloadError", { key: variables.key });

        setActionError(errorMessage);
        showToast(errorMessage, "error");

        return;
      }

      const successMessage =
        data.message || t("toast.reloadSuccess", { key: variables.key });

      setActionError(null);
      showToast(successMessage, "success");
      queryClient.invalidateQueries({ queryKey: MODEL_LIST_QUERY_KEY });
    },
    onError: (error, variables) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("toast.reloadError", { key: variables?.key ?? "-" });

      setActionError(errorMessage);
      showToast(errorMessage, "error");
    },
  });

  const handleReload = useCallback(
    (key: string) => {
      setActionError(null);
      reloadModelMutation.mutate({ key });
    },
    [reloadModelMutation],
  );

  const handleRefresh = useCallback(() => {
    setActionError(null);
    modelListQuery.refetch();
  }, [modelListQuery]);

  const models = modelListQuery.data ?? [];
  const currentReloadKey = reloadModelMutation.variables?.key;
  const loading = modelListQuery.isLoading || modelListQuery.isFetching;
  const queryErrorMessage =
    modelListQuery.error instanceof Error ? t("toast.loadError") : null;

  useEffect(() => {
    if (queryErrorMessage) {
      showToast(queryErrorMessage, "error");
    }
  }, [queryErrorMessage, showToast]);

  const miniSearch = useMemo(() => {
    const search = new MiniSearch<ModelRow>({
      fields: ["key", "module", "path"],
      storeFields: ["key", "module", "path"],
      idField: "key",
    });

    if (models.length) {
      search.addAll(models);
    }

    return search;
  }, [models]);

  const filteredModels = useMemo<ModelRow[]>(() => {
    if (!searchTerm.trim()) {
      return models;
    }

    const results = miniSearch.search(searchTerm, {
      prefix: true,
      fuzzy: 0.2,
    });

    if (!results.length) {
      return [];
    }

    return results.map(({ key, module, path }) => ({ key, module, path }));
  }, [miniSearch, models, searchTerm]);

  const columns = useMemo<IBaseTableColumnDefinition<ModelRow>[]>(
    () => [
      { key: "key", label: t("table.columns.key") },
      { key: "module", label: t("table.columns.module") },
      { key: "path", label: t("table.columns.path") },
      {
        key: "action",
        label: actionsT("action"),
        align: "end",
        render: (_, record) => (
          <IBaseButton
            color="primary"
            isDisabled={
              loading ||
              (reloadModelMutation.isPending && currentReloadKey === record.key)
            }
            isLoading={
              reloadModelMutation.isPending && currentReloadKey === record.key
            }
            size="sm"
            onPress={() => handleReload(record.key)}
          >
            {actionsT("reload")}
          </IBaseButton>
        ),
      },
    ],
    [
      actionsT,
      currentReloadKey,
      handleReload,
      loading,
      reloadModelMutation.isPending,
      t,
    ],
  );

  const emptyStateMessage =
    actionError ||
    queryErrorMessage ||
    (searchTerm.trim() && filteredModels.length === 0
      ? t("table.empty.search")
      : t("table.empty.default"));

  return (
    <IBaseCard>
      <IBaseCardBody className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <IBaseInput
              isClearable
              classNames={{
                input: "text-sm",
              }}
              labelPlacement="outside"
              placeholder={t("filters.searchPlaceholder")}
              size="sm"
              value={searchTerm}
              onClear={() => setSearchTerm("")}
              onValueChange={setSearchTerm}
            />
          </div>
          <IBaseTable
            columns={columns}
            dataSource={filteredModels}
            emptyContent={emptyStateMessage}
            loading={loading}
            pagination={false}
            rowKey="key"
            total={filteredModels.length}
            onRefresh={handleRefresh}
          />
        </div>
        {toast && (
          <div className="fixed right-4 top-4 z-50 flex max-w-sm flex-col gap-2">
            <div
              className={`rounded-medium px-4 py-3 text-sm shadow-large ${toast.type === "error" ? "bg-danger-100 text-danger" : "bg-success-100 text-success"}`}
            >
              {toast.message}
            </div>
          </div>
        )}
      </IBaseCardBody>
    </IBaseCard>
  );
}
