import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import StockService from "../../../services/StockService";
import type {
  AdjustPayload,
  InOutPayload,
  MovementResult,
  TransferPayload,
} from "../types";

export function useStockMutations() {
  const queryClient = useQueryClient();

  const onMovementSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["stockSummary"] });
  }, [queryClient]);

  const onMovementError = useCallback((error: unknown) => {
    return {
      type: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to process stock movement.",
    } as MovementResult;
  }, []);

  const adjustMutation = useMutation({
    mutationFn: async (payload: AdjustPayload) => {
      const response = await StockService.adjustStock(payload);
      if (!response.success) {
        throw new Error(response.message ?? "Failed to adjust stock.");
      }
    },
    onSuccess: onMovementSuccess,
    onError: onMovementError,
  });

  const receiveMutation = useMutation({
    mutationFn: async (payload: InOutPayload) => {
      const response = await StockService.receiveStock(payload);
      if (!response.success) {
        throw new Error(response.message ?? "Failed to receive stock.");
      }
    },
    onSuccess: onMovementSuccess,
    onError: onMovementError,
  });

  const issueMutation = useMutation({
    mutationFn: async (payload: InOutPayload) => {
      const response = await StockService.issueStock(payload);
      if (!response.success) {
        throw new Error(response.message ?? "Failed to issue stock.");
      }
    },
    onSuccess: onMovementSuccess,
    onError: onMovementError,
  });

  const transferMutation = useMutation({
    mutationFn: async (payload: TransferPayload) => {
      const response = await StockService.transferStock(payload);
      if (!response.success) {
        throw new Error(response.message ?? "Failed to transfer stock.");
      }
    },
    onSuccess: onMovementSuccess,
    onError: onMovementError,
  });

  const handleMovement = useCallback(
    async (
      action: "adjust" | "inbound" | "outbound" | "transfer",
      payload: Record<string, string | number | undefined>
    ): Promise<MovementResult | null> => {
      try {
        switch (action) {
          case "adjust":
            await adjustMutation.mutateAsync({
              productId: String(payload.productId),
              warehouseId: String(payload.warehouseId),
              quantityDelta: Number(payload.quantityDelta),
              reference: payload.reference
                ? String(payload.reference)
                : undefined,
              note: payload.note ? String(payload.note) : undefined,
            });
            return {
              type: "success",
              message: "Stock movement recorded successfully.",
            };
          case "inbound":
            await receiveMutation.mutateAsync({
              productId: String(payload.productId),
              warehouseId: String(payload.warehouseId),
              quantity: Number(payload.quantity),
              reference: payload.reference
                ? String(payload.reference)
                : undefined,
              note: payload.note ? String(payload.note) : undefined,
            });
            return {
              type: "success",
              message: "Stock movement recorded successfully.",
            };
          case "outbound":
            await issueMutation.mutateAsync({
              productId: String(payload.productId),
              warehouseId: String(payload.warehouseId),
              quantity: Number(payload.quantity),
              reference: payload.reference
                ? String(payload.reference)
                : undefined,
              note: payload.note ? String(payload.note) : undefined,
            });
            return {
              type: "success",
              message: "Stock movement recorded successfully.",
            };
          case "transfer":
            await transferMutation.mutateAsync({
              productId: String(payload.productId),
              sourceWarehouseId: String(payload.sourceWarehouseId),
              targetWarehouseId: String(payload.targetWarehouseId),
              quantity: Number(payload.quantity),
              reference: payload.reference
                ? String(payload.reference)
                : undefined,
              note: payload.note ? String(payload.note) : undefined,
            });
            return {
              type: "success",
              message: "Stock movement recorded successfully.",
            };
          default:
            return null;
        }
      } catch (error) {
        return onMovementError(error);
      }
    },
    [adjustMutation, issueMutation, receiveMutation, transferMutation, onMovementError]
  );

  return {
    adjustMutation,
    receiveMutation,
    issueMutation,
    transferMutation,
    handleMovement,
  };
}

