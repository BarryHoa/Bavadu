"use client";

import LinkAs from "@base/client/components/LinkAs";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import type { WarehousePayload } from "../../services/StockService";
import StockService from "../../services/StockService";
import WarehouseForm from "./components/WarehouseForm";

export default function WarehouseCreatePage(): React.ReactNode {
  const router = useRouter();

  const handleSubmit = useCallback(
    async (payload: WarehousePayload) => {
      await StockService.createWarehouse(payload);
      router.push("/workspace/modules/stock/warehouses");
    },
    [router]
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Warehouse</h1>
          <p className="text-default-500">
            Define the core details and controls for a new warehouse location.
          </p>
        </div>
        <Button
          as={LinkAs as any}
          size="sm"
          variant="light"
          href="/workspace/modules/stock/warehouses"
        >
          Back to list
        </Button>
      </div>

      <WarehouseForm
        submitLabel="Create warehouse"
        onSubmit={handleSubmit}
        secondaryAction={
          <Button
            size="sm"
            variant="light"
            onPress={() =>
              router.push("/workspace/modules/stock/warehouses")
            }
          >
            Cancel
          </Button>
        }
      />
    </div>
  );
}

