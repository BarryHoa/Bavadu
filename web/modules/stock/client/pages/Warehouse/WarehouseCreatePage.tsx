"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import type {
  WarehouseDto,
  WarehousePayload,
} from "../../services/StockService";
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
      if (!response.success || !response.data) {
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
    [handleSubmit]
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <WarehouseForm
        submitLabel="Create warehouse"
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
    </div>
  );
}
