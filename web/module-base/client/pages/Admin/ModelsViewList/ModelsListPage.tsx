"use client";

import { Button } from "@heroui/button";
import { useCallback, useEffect, useMemo, useState } from "react";

import DataTable, {
  DataTableColumn,
} from "@/module-base/client/components/DataTable";

import adminModelService from "./services/AdminModelService";

type ModelRow = {
  key: string;
};

export default function ModelsListPage() {
  const [models, setModels] = useState<ModelRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [reloadingKey, setReloadingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminModelService.getModelList();
      if (!response.success) {
        throw new Error(response.message || "Failed to load models.");
      }

      const data = Array.isArray(response.data) ? response.data : [];
      setModels(data.map((key) => ({ key })));
      setErrorMessage(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load models.";
      setErrorMessage(message);
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleReload = useCallback(
    async (key: string) => {
      setReloadingKey(key);
      try {
        const response = await adminModelService.reloadModel({ key });
        if (!response.success) {
          throw new Error(response.message || `Failed to reload model ${key}.`);
        }

        await fetchModels();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : `Failed to reload model ${key}.`;
        setErrorMessage(message);
      } finally {
        setReloadingKey(null);
      }
    },
    [fetchModels]
  );

  const columns = useMemo<DataTableColumn<ModelRow>[]>(
    () => [
      { key: "key", label: "Key" },
      {
        key: "action",
        label: "Action",
        render: (_, record) => (
          <Button
            size="sm"
            color="primary"
            isDisabled={loading || reloadingKey === record.key}
            isLoading={reloadingKey === record.key}
            onPress={() => handleReload(record.key)}
          >
            Reload
          </Button>
        ),
      },
    ],
    [handleReload, reloadingKey, loading]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Models</h1>
        <Button
          size="sm"
          variant="flat"
          onPress={fetchModels}
          isLoading={loading}
          isDisabled={loading}
        >
          Refresh
        </Button>
      </div>
      {errorMessage && <p className="text-danger-500 text-sm">{errorMessage}</p>}
      <DataTable
        rowKey="key"
        columns={columns}
        dataSource={models}
        pagination={false}
        loading={loading}
        emptyContent={errorMessage ?? "No models found."}
      />
    </div>
  );
}