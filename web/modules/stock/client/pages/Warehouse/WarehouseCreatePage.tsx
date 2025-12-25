"use client";

import type {
  WarehouseDto,
  WarehousePayload,
} from "../../services/StockService";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { IBaseButton } from "@base/client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import StockService from "../../services/StockService";

import WarehouseForm from "./components/WarehouseForm";

export default function WarehouseCreatePage(): React.ReactNode {
  const router = useRouter();

  const { handleSubmit, error } = useCreateUpdate<
    WarehousePayload,
    WarehouseDto
  >({
    mutationFn: async (payload) => {
      const response = await StockService.createWarehouse(payload);

      if (!response.data) {
        throw new Error(response.message ?? "Failed to create warehouse.");
      }

      return response.data;
    },
    invalidateQueries: [["warehouses"]],
    onSuccess: () => {
      router.push("/workspace/modules/stock/warehouses");
    },
  });

  const handleFormSubmit = useCallback(
    async (payload: WarehousePayload) => {
      await handleSubmit(payload);
    },
    [handleSubmit],
  );

  return (
    <div className="w-full space-y-6">
      <WarehouseForm
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
        submitLabel="Create warehouse"
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
