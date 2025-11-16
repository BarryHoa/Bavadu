"use client";

import LinkAs from "@base/client/components/LinkAs";
import { Button } from "@heroui/button";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import QuickActionsSection from "./components/QuickActionsSection";
import StockSummarySection from "./components/StockSummarySection";
import { useStockMutations } from "./hooks/useStockMutations";
import type { MovementResult, StockFilters } from "./types";

export default function StockDashboardPage(): React.ReactNode {
  const router = useRouter();
  const [filters, setFilters] = useState<StockFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<StockFilters>({});
  const [movementResult, setMovementResult] = useState<MovementResult | null>(
    null
  );

  const {
    adjustMutation,
    receiveMutation,
    issueMutation,
    transferMutation,
    handleMovement,
  } = useStockMutations();

  const warehousesQuery = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const res = await fetch("/api/modules/stock/warehouses");
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message ?? "Failed to load warehouses.");
      }
      return json.data ?? [];
    },
  });

  const handleFilterChange = useCallback((newFilters: StockFilters) => {
    setAppliedFilters(newFilters);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    setAppliedFilters({});
  }, []);

  const handleAdjust = useCallback(
    async (data: {
      productId: string;
      quantity: string;
      reference?: string;
      note?: string;
      primaryWarehouseId: string;
      secondaryWarehouseId?: string;
    }): Promise<void> => {
      setMovementResult(null);
      const result = await handleMovement("adjust", {
        productId: data.productId,
        warehouseId: data.primaryWarehouseId,
        quantityDelta: Number(data.quantity),
        reference: data.reference,
        note: data.note,
      });
      if (result) {
        setMovementResult(result);
      }
    },
    [handleMovement]
  );

  const handleReceive = useCallback(
    async (data: {
      productId: string;
      quantity: string;
      reference?: string;
      note?: string;
      primaryWarehouseId: string;
      secondaryWarehouseId?: string;
    }): Promise<void> => {
      setMovementResult(null);
      const result = await handleMovement("inbound", {
        productId: data.productId,
        warehouseId: data.primaryWarehouseId,
        quantity: Number(data.quantity),
        reference: data.reference,
        note: data.note,
      });
      if (result) {
        setMovementResult(result);
      }
    },
    [handleMovement]
  );

  const handleIssue = useCallback(
    async (data: {
      productId: string;
      quantity: string;
      reference?: string;
      note?: string;
      primaryWarehouseId: string;
      secondaryWarehouseId?: string;
    }): Promise<void> => {
      setMovementResult(null);
      const result = await handleMovement("outbound", {
        productId: data.productId,
        warehouseId: data.primaryWarehouseId,
        quantity: Number(data.quantity),
        reference: data.reference,
        note: data.note,
      });
      if (result) {
        setMovementResult(result);
      }
    },
    [handleMovement]
  );

  const handleTransfer = useCallback(
    async (data: {
      productId: string;
      quantity: string;
      reference?: string;
      note?: string;
      primaryWarehouseId: string;
      secondaryWarehouseId?: string;
    }): Promise<void> => {
      setMovementResult(null);
      const result = await handleMovement("transfer", {
        productId: data.productId,
        sourceWarehouseId: data.primaryWarehouseId,
        targetWarehouseId: data.secondaryWarehouseId as string,
        quantity: Number(data.quantity),
        reference: data.reference,
        note: data.note,
      });
      if (result) {
        setMovementResult(result);
      }
    },
    [handleMovement]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          as={LinkAs as any}
          size="sm"
          color="primary"
          href="/workspace/modules/stock/warehouses"
        >
          Manage warehouses
        </Button>
      </div>

      <StockSummarySection
        filters={filters}
        appliedFilters={appliedFilters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        warehouses={warehousesQuery.data ?? []}
        warehousesLoading={warehousesQuery.isLoading}
      />

      <QuickActionsSection
        warehouses={warehousesQuery.data ?? []}
        movementResult={movementResult}
        adjustMutationPending={adjustMutation.isPending}
        receiveMutationPending={receiveMutation.isPending}
        issueMutationPending={issueMutation.isPending}
        transferMutationPending={transferMutation.isPending}
        onAdjust={handleAdjust}
        onReceive={handleReceive}
        onIssue={handleIssue}
        onTransfer={handleTransfer}
      />

      <div className="flex items-center justify-end">
        <Button
          size="sm"
          variant="light"
          onPress={() => router.push("/workspace/modules/purchase")}
        >
          Go to Purchase Orders
        </Button>
        <Button
          size="sm"
          variant="light"
          className="ml-2"
          onPress={() => router.push("/workspace/modules/sale")}
        >
          Go to Sales Orders
        </Button>
      </div>
    </div>
  );
}
