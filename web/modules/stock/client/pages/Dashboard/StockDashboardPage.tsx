"use client";

import type { MovementResult, StockFilters } from "./types";

import { IBaseButton } from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import QuickActionsSection from "./components/QuickActionsSection";
import StockSummarySection from "./components/StockSummarySection";
import { useStockMutations } from "./hooks/useStockMutations";

export default function StockDashboardPage(): React.ReactNode {
  const router = useRouter();
  const [filters, setFilters] = useState<StockFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<StockFilters>({});
  const [movementResult, setMovementResult] = useState<MovementResult | null>(
    null,
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

      if (!res.ok) {
        throw new Error("Failed to load warehouses.");
      }
      const json = await res.json();

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
    [handleMovement],
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
    [handleMovement],
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
    [handleMovement],
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
    [handleMovement],
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <IBaseButton
          as={LinkAs as any}
          color="primary"
          href="/workspace/modules/stock/warehouses"
          size="sm"
        >
          Manage warehouses
        </IBaseButton>
      </div>

      <StockSummarySection
        appliedFilters={appliedFilters}
        filters={filters}
        warehouses={warehousesQuery.data ?? []}
        warehousesLoading={warehousesQuery.isLoading}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      <QuickActionsSection
        adjustMutationPending={adjustMutation.isPending}
        issueMutationPending={issueMutation.isPending}
        movementResult={movementResult}
        receiveMutationPending={receiveMutation.isPending}
        transferMutationPending={transferMutation.isPending}
        warehouses={warehousesQuery.data ?? []}
        onAdjust={handleAdjust}
        onIssue={handleIssue}
        onReceive={handleReceive}
        onTransfer={handleTransfer}
      />

      <div className="flex items-center justify-end">
        <IBaseButton
          size="sm"
          variant="light"
          onPress={() => router.push("/workspace/modules/purchase")}
        >
          Go to Purchase Orders
        </IBaseButton>
        <IBaseButton
          className="ml-2"
          size="sm"
          variant="light"
          onPress={() => router.push("/workspace/modules/b2b-sales/orders")}
        >
          Go to Sales Orders
        </IBaseButton>
      </div>
    </div>
  );
}
