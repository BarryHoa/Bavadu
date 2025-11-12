/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Input from "@base/client/components/Input";
import LinkAs from "@base/client/components/LinkAs";
import Select, { SelectItem } from "@base/client/components/Select";
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
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [summary, setSummary] = useState<StockSummaryItem[]>([]);
  const [filters, setFilters] = useState<{
    productId?: string;
    warehouseId?: string;
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [movementResult, setMovementResult] = useState<MovementResult | null>(
    null
  );

  const loadWarehouses = useCallback(async () => {
    try {
      const response = await StockService.listWarehouses();
      setWarehouses(response.data ?? []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const loadSummary = useCallback(
    async (override?: { productId?: string; warehouseId?: string }) => {
      setIsLoading(true);
      try {
        const response = await StockService.getStockSummary(
          override ?? filters
        );
        setSummary(
          (response.data ?? []).map((item) => ({
            ...item,
            quantity: Number(item.quantity),
            reservedQuantity: Number(item.reservedQuantity),
          }))
        );
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    loadWarehouses();
    loadSummary();
  }, []);

  const handleFilterChange = async () => {
    await loadSummary();
  };

  const handleResetFilters = async () => {
    setFilters({});
    await loadSummary({});
  };

  const handleMovement = async (
    action: "adjust" | "inbound" | "outbound" | "transfer",
    payload: Record<string, string | number | undefined>
  ) => {
    try {
      setMovementResult(null);
      switch (action) {
        case "adjust":
          await StockService.adjustStock({
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
          await StockService.receiveStock({
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
          await StockService.issueStock({
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
          await StockService.transferStock({
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
      setMovementResult({
        type: "success",
        message: "Stock movement recorded successfully.",
      });
      await loadSummary();
    } catch (error) {
      console.error(error);
      setMovementResult({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to process stock movement.",
      });
    }
  };

  const warehouseOptions = useMemo(
    () =>
      warehouses.map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.code} — ${warehouse.name}`,
      })),
    [warehouses]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Stock Dashboard</h1>
          <p className="text-default-500">
            Monitor inventory levels and execute quick stock operations.
          </p>
        </div>
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
            <Input
              label="Product ID"
              placeholder="Optional product ID filter"
              value={filters.productId ?? ""}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  productId: value || undefined,
                }))
              }
              // isDisabled
            />
            <Select
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
              isDisabled
            >
              {warehouseOptions.map((option) => (
                <SelectItem key={option.value}>{option.label}</SelectItem>
              ))}
            </Select>
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

          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Spinner label="Loading stock summary..." />
            </div>
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
              warehouses={warehouses}
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
              warehouses={warehouses}
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
              warehouses={warehouses}
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
              warehouses={warehouses}
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-content3/40">
      <CardBody className="space-y-3">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-default-500">{description}</p>
        </div>
        <Input
          label="Product ID"
          placeholder="Product identifier"
          value={formValues.productId}
          onValueChange={(value) => handleChange("productId", value)}
        />
        <Input
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
            <SelectItem key={warehouse.id}>
              {warehouse.code} — {warehouse.name}
            </SelectItem>
          ))}
        </Select>
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
              <SelectItem key={warehouse.id}>
                {warehouse.code} — {warehouse.name}
              </SelectItem>
            ))}
          </Select>
        ) : null}
        <Input
          label="Reference"
          placeholder="Optional reference"
          value={formValues.reference}
          onValueChange={(value) => handleChange("reference", value)}
        />
        <Input
          label="Note"
          placeholder="Optional note"
          value={formValues.note}
          onValueChange={(value) => handleChange("note", value)}
        />
        <Button
          color="primary"
          size="sm"
          isLoading={isSubmitting}
          onPress={handleSubmit}
        >
          {actionLabel}
        </Button>
      </CardBody>
    </Card>
  );
}
