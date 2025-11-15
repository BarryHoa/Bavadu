"use client";

import { IBaseInput } from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import { IBaseSelect, SelectItem } from "@base/client/components";
import { Button } from "@heroui/button";
import {
  Card,
  CardBody,
  Divider,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import StockService, {
  StockSummaryItem,
  WarehouseDto,
} from "../../services/StockService";

interface MovementResult {
  type: "success" | "error";
  message: string;
}

export default function StockDashboardPage(): React.ReactNode {
  const router = useRouter();
  const [filters, setFilters] = useState<{
    productId?: string;
    warehouseId?: string;
  }>({});
  const [appliedFilters, setAppliedFilters] = useState<{
    productId?: string;
    warehouseId?: string;
  }>({});
  const [movementResult, setMovementResult] = useState<MovementResult | null>(
    null
  );

  const queryClient = useQueryClient();

  const warehousesQuery = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const response = await StockService.listWarehouses();
      if (!response.success) {
        throw new Error(response.message ?? "Failed to load warehouses.");
      }

      return response.data ?? [];
    },
  });

  const stockSummaryQuery = useQuery({
    queryKey: ["stockSummary", appliedFilters],
    queryFn: async () => {
      const response = await StockService.getStockSummary(appliedFilters);
      if (!response.success) {
        throw new Error(response.message ?? "Failed to load stock summary.");
      }

      return (response.data ?? []).map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        reservedQuantity: Number(item.reservedQuantity),
      }));
    },
  });

  const handleFilterChange = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    setAppliedFilters({});
  }, []);

  const onMovementSuccess = useCallback(() => {
    setMovementResult({
      type: "success",
      message: "Stock movement recorded successfully.",
    });
    queryClient.invalidateQueries({ queryKey: ["stockSummary"] });
  }, [queryClient]);

  const onMovementError = useCallback((error: unknown) => {
    setMovementResult({
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "Failed to process stock movement.",
    });
  }, []);

  type AdjustPayload = {
    productId: string;
    warehouseId: string;
    quantityDelta: number;
    reference?: string;
    note?: string;
  };

  type InOutPayload = {
    productId: string;
    warehouseId: string;
    quantity: number;
    reference?: string;
    note?: string;
  };

  type TransferPayload = {
    productId: string;
    sourceWarehouseId: string;
    targetWarehouseId: string;
    quantity: number;
    reference?: string;
    note?: string;
  };

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
    ) => {
      setMovementResult(null);
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
            break;
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
            break;
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
            break;
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
            break;
          default:
            break;
        }
      } catch {
        // error handled in onError
      }
    },
    [adjustMutation, issueMutation, receiveMutation, transferMutation]
  );

  const warehouseOptions = useMemo(
    () =>
      (warehousesQuery.data ?? []).map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.code} — ${warehouse.name}`,
      })),
    [warehousesQuery.data]
  );

  const summary = stockSummaryQuery.data ?? [];

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

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <IBaseInput
              label="Product ID"
              placeholder="Optional product ID filter"
              value={filters.productId ?? ""}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  productId: value || undefined,
                }))
              }
            />
            <IBaseSelect
              label="Warehouse"
              selectedKeys={
                new Set<string>(
                  filters.warehouseId ? [filters.warehouseId] : []
                )
              }
              onSelectionChange={(keys) => {
                const [first] = Array.from(keys);
                setFilters((prev) => ({
                  ...prev,
                  warehouseId: typeof first === "string" ? first : undefined,
                }));
              }}
              className="max-w-xs"
              isDisabled={
                warehousesQuery.isLoading || warehouseOptions.length === 0
              }
            >
              {warehouseOptions.map((option) => (
                <IBaseSelectItem key={option.value}>{option.label}</SelectItem>
              ))}
              </IBaseSelect>
            <div className="flex items-center gap-2">
              <Button color="primary" onPress={handleFilterChange} size="sm">
                Apply
              </Button>
              <Button onPress={handleResetFilters} size="sm" variant="light">
                Reset
              </Button>
            </div>
          </div>

          <Divider />

          {stockSummaryQuery.isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Spinner label="Loading stock summary..." />
            </div>
          ) : stockSummaryQuery.isError ? (
            <p className="text-danger-500">
              {stockSummaryQuery.error instanceof Error
                ? stockSummaryQuery.error.message
                : "Failed to load stock summary."}
            </p>
          ) : summary.length === 0 ? (
            <p className="text-default-500">No stock data available.</p>
          ) : (
            <Table aria-label="Stock summary table" removeWrapper>
              <TableHeader>
                <TableColumn>Product</TableColumn>
                <TableColumn>Warehouse</TableColumn>
                <TableColumn>On Hand</TableColumn>
                <TableColumn>Reserved</TableColumn>
              </TableHeader>
              <TableBody>
                {summary.map((row) => (
                  <TableRow key={`${row.productId}-${row.warehouseId}`}>
                    <TableCell>
                      <LinkAs
                        href={`/workspace/modules/product/view/${row.productId}`}
                      >
                        {row.productId}
                      </LinkAs>
                    </TableCell>
                    <TableCell>{row.warehouseId}</TableCell>
                    <TableCell>{row.quantity.toFixed(2)}</TableCell>
                    <TableCell>{row.reservedQuantity.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <p className="text-default-500">
            Use these forms to adjust inventory levels quickly.
          </p>

          {movementResult ? (
            <div
              className={`rounded-medium border px-4 py-3 text-sm ${
                movementResult.type === "success"
                  ? "border-success-200 bg-success-50 text-success-600"
                  : "border-danger-200 bg-danger-50 text-danger-600"
              }`}
            >
              {movementResult.message}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MovementCard
              title="Adjust Stock"
              description="Modify the on-hand quantity for a single warehouse."
              actionLabel="Adjust"
              warehouses={warehousesQuery.data ?? []}
              onSubmit={(data) =>
                handleMovement("adjust", {
                  productId: data.productId,
                  warehouseId: data.primaryWarehouseId,
                  quantityDelta: Number(data.quantity),
                  reference: data.reference,
                  note: data.note,
                })
              }
            />

            <MovementCard
              title="Receive Stock"
              description="Register incoming inventory for purchase receipts."
              actionLabel="Receive"
              warehouses={warehousesQuery.data ?? []}
              submitting={receiveMutation.isPending}
              onSubmit={(data) =>
                handleMovement("inbound", {
                  productId: data.productId,
                  warehouseId: data.primaryWarehouseId,
                  quantity: Number(data.quantity),
                  reference: data.reference,
                  note: data.note,
                })
              }
            />

            <MovementCard
              title="Issue Stock"
              description="Deduct inventory for sales or consumption."
              actionLabel="Issue"
              warehouses={warehousesQuery.data ?? []}
              submitting={issueMutation.isPending}
              onSubmit={(data) =>
                handleMovement("outbound", {
                  productId: data.productId,
                  warehouseId: data.primaryWarehouseId,
                  quantity: Number(data.quantity),
                  reference: data.reference,
                  note: data.note,
                })
              }
            />

            <MovementCard
              title="Transfer Stock"
              description="Move inventory between two warehouses."
              actionLabel="Transfer"
              warehouses={warehousesQuery.data ?? []}
              submitting={transferMutation.isPending}
              requireSecondaryWarehouse
              onSubmit={(data) =>
                handleMovement("transfer", {
                  productId: data.productId,
                  sourceWarehouseId: data.primaryWarehouseId,
                  targetWarehouseId: data.secondaryWarehouseId as string,
                  quantity: Number(data.quantity),
                  reference: data.reference,
                  note: data.note,
                })
              }
            />
          </div>
        </CardBody>
      </Card>

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

interface MovementCardProps {
  title: string;
  description: string;
  actionLabel: string;
  warehouses: WarehouseDto[];
  requireSecondaryWarehouse?: boolean;
  submitting?: boolean;
  onSubmit: (payload: {
    productId: string;
    quantity: string;
    reference?: string;
    note?: string;
    primaryWarehouseId: string;
    secondaryWarehouseId?: string;
  }) => Promise<void>;
}

function MovementCard({
  title,
  description,
  actionLabel,
  warehouses,
  requireSecondaryWarehouse,
  submitting = false,
  onSubmit,
}: MovementCardProps) {
  const [formValues, setFormValues] = useState({
    productId: "",
    quantity: "",
    primaryWarehouseId: "",
    secondaryWarehouseId: "",
    reference: "",
    note: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formValues.productId ||
      !formValues.quantity ||
      !formValues.primaryWarehouseId ||
      (requireSecondaryWarehouse && !formValues.secondaryWarehouseId)
    ) {
      return;
    }

    try {
      await onSubmit(formValues);
      setFormValues({
        productId: "",
        quantity: "",
        primaryWarehouseId: "",
        secondaryWarehouseId: "",
        reference: "",
        note: "",
      });
    } finally {
      // handled by parent
    }
  };

  return (
    <Card className="border border-content3/40">
      <CardBody className="space-y-3">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-default-500">{description}</p>
        </div>
        <IBaseInput
          label="Product ID"
          placeholder="Product identifier"
          value={formValues.productId}
          onValueChange={(value) => handleChange("productId", value)}
        />
        <IBaseInput
          label="Quantity"
          type="number"
          value={formValues.quantity}
          onValueChange={(value) => handleChange("quantity", value)}
        />
        <Select
          label="Warehouse"
          selectedKeys={
            new Set<string>(
              formValues.primaryWarehouseId
                ? [formValues.primaryWarehouseId]
                : []
            )
          }
          onSelectionChange={(keys) => {
            const [first] = Array.from(keys);
            handleChange(
              "primaryWarehouseId",
              typeof first === "string" ? first : ""
            );
          }}
        >
          {warehouses.map((warehouse) => (
            <IBaseSelectItem key={warehouse.id}>
              {warehouse.code} — {warehouse.name}
            </SelectItem>
          ))}
              </IBaseSelect>
        {requireSecondaryWarehouse ? (
          <Select
            label="Target Warehouse"
            selectedKeys={
              new Set<string>(
                formValues.secondaryWarehouseId
                  ? [formValues.secondaryWarehouseId]
                  : []
              )
            }
            onSelectionChange={(keys) => {
              const [first] = Array.from(keys);
              handleChange(
                "secondaryWarehouseId",
                typeof first === "string" ? first : ""
              );
            }}
          >
            {warehouses.map((warehouse) => (
              <IBaseSelectItem key={warehouse.id}>
                {warehouse.code} — {warehouse.name}
              </SelectItem>
            ))}
              </IBaseSelect>
        ) : null}
        <IBaseInput
          label="Reference"
          placeholder="Optional reference"
          value={formValues.reference}
          onValueChange={(value) => handleChange("reference", value)}
        />
        <IBaseInput
          label="Note"
          placeholder="Optional note"
          value={formValues.note}
          onValueChange={(value) => handleChange("note", value)}
        />
        <Button
          color="primary"
          size="sm"
          isLoading={submitting}
          onPress={handleSubmit}
        >
          {actionLabel}
        </Button>
      </CardBody>
    </Card>
  );
}
