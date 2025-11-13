"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { Button } from "@heroui/button";
import { Card, CardBody, Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import type {
  WarehouseDto,
  WarehousePayload,
} from "../../services/StockService";
import StockService from "../../services/StockService";
import WarehouseForm from "./components/WarehouseForm";

export default function WarehouseEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const warehouseId = useMemo(() => {
    const value = params?.id;
    if (!value) return undefined;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const warehouseQuery = useQuery({
    queryKey: ["warehouses", warehouseId],
    enabled: Boolean(warehouseId),
    queryFn: async () => {
      if (!warehouseId) {
        throw new Error("Warehouse identifier is missing.");
      }

      const response = await StockService.getWarehouseById(warehouseId);
      if (!response.success || !response.data) {
        throw new Error(response.message ?? "Unable to load warehouse.");
      }

      return response.data;
    },
  });

  const { handleSubmit, error } = useCreateUpdate<
    WarehousePayload & { id: string },
    WarehouseDto
  >({
    mutationFn: async (payload) => {
      const response = await StockService.updateWarehouse(payload);
      if (!response.success || !response.data) {
        throw new Error(response.message ?? "Failed to update warehouse.");
      }

      return response.data;
    },
    invalidateQueries: [["warehouses"], ["warehouses", warehouseId]],
    onSuccess: () => {
      router.push("/workspace/modules/stock/warehouses");
    },
  });

  const handleFormSubmit = useCallback(
    async (payload: WarehousePayload) => {
      if (!warehouseId) {
        return;
      }

      await handleSubmit({ ...payload, id: warehouseId });
    },
    [handleSubmit, warehouseId]
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="light"
          onPress={() => router.push("/workspace/modules/stock/warehouses")}
        >
          Back to list
        </Button>
      </div>

      {warehouseQuery.isLoading ? (
        <Card>
          <CardBody className="flex items-center justify-center py-10">
            <Spinner label="Loading warehouse..." />
          </CardBody>
        </Card>
      ) : warehouseQuery.isError ? (
        <Card>
          <CardBody className="space-y-3">
            <p className="text-default-500">
              {warehouseQuery.error instanceof Error
                ? warehouseQuery.error.message
                : "Failed to load warehouse."}
            </p>
            <Button
              size="sm"
              onPress={() => router.push("/workspace/modules/stock/warehouses")}
            >
              Back to list
            </Button>
          </CardBody>
        </Card>
      ) : warehouseQuery.data ? (
        <WarehouseForm
          initialData={warehouseQuery.data}
          submitLabel="Save changes"
          onSubmit={handleFormSubmit}
          submitError={error}
          secondaryAction={
            <Button
              size="sm"
              variant="light"
              onPress={() => router.push("/workspace/modules/stock/warehouses")}
            >
              Cancel
            </Button>
          }
        />
      ) : null}
    </div>
  );
}
