"use client";

import type {
  WarehouseDto,
  WarehousePayload,
} from "../../services/StockService";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import React from "react";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { IBaseButton } from "@base/client";
import { IBaseCard, IBaseCardBody, IBaseSpinner } from "@base/client";

import StockService from "../../services/StockService";

import WarehouseForm from "./components/WarehouseForm";

export default function WarehouseEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  // React Compiler will automatically optimize this computation
  const value = params?.id;
  const warehouseId = !value ? undefined : Array.isArray(value) ? value[0] : value;

  const warehouseQuery = useQuery({
    queryKey: ["warehouses", warehouseId],
    enabled: Boolean(warehouseId),
    queryFn: async () => {
      if (!warehouseId) {
        throw new Error("Warehouse identifier is missing.");
      }

      const response = await StockService.getWarehouseById(warehouseId);

      if (!response.data) {
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

      if (!response.data) {
        throw new Error(response.message ?? "Failed to update warehouse.");
      }

      return response.data;
    },
    invalidateQueries: [["warehouses"], ["warehouses", warehouseId]],
    onSuccess: () => {
      router.push("/workspace/modules/stock/warehouses");
    },
  });

  // React Compiler will automatically optimize this callback
  const handleFormSubmit = async (payload: WarehousePayload) => {
    if (!warehouseId) {
      return;
    }

    await handleSubmit({ ...payload, id: warehouseId });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-end">
        <IBaseButton
          size="sm"
          variant="light"
          onPress={() => router.push("/workspace/modules/stock/warehouses")}
        >
          Back to list
        </IBaseButton>
      </div>

      {warehouseQuery.isLoading ? (
        <IBaseCard>
          <IBaseCardBody className="flex items-center justify-center py-10">
            <IBaseSpinner label="Loading warehouse..." />
          </IBaseCardBody>
        </IBaseCard>
      ) : warehouseQuery.isError ? (
        <IBaseCard>
          <IBaseCardBody className="space-y-3">
            <p className="text-default-500">
              {warehouseQuery.error instanceof Error
                ? warehouseQuery.error.message
                : "Failed to load warehouse."}
            </p>
            <IBaseButton
              size="sm"
              onPress={() => router.push("/workspace/modules/stock/warehouses")}
            >
              Back to list
            </IBaseButton>
          </IBaseCardBody>
        </IBaseCard>
      ) : warehouseQuery.data ? (
        <WarehouseForm
          initialData={warehouseQuery.data}
          secondaryAction={
            <IBaseButton
              size="sm"
              variant="light"
              onPress={() => router.push("/workspace/modules/stock/warehouses")}
            >
              Cancel
            </IBaseButton>
          }
          submitError={error}
          submitLabel="Save changes"
          onSubmit={handleFormSubmit}
        />
      ) : null}
    </div>
  );
}
