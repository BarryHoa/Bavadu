"use client";

import LinkAs from "@base/client/components/LinkAs";
import { Button } from "@heroui/button";
import {
  Card,
  CardBody,
  Chip,
  Divider,
  Input as HeroInput,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
} from "@heroui/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  salesOrderService,
  SalesOrderDto,
  SalesOrderLineDto,
} from "../../services/SalesOrderService";

export default function SalesOrderDetailPage(): React.ReactNode {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params?.id;

  const [order, setOrder] = useState<SalesOrderDto | null>(null);
  const [lines, setLines] = useState<SalesOrderLineDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliverNote, setDeliverNote] = useState("");
  const [deliverWarehouseId, setDeliverWarehouseId] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await salesOrderService.getById(orderId);
      setOrder(response.data.order);
      setLines(response.data.lines);
      setDeliverWarehouseId(response.data.order.warehouseId ?? "");
      setQuantities(
        response.data.lines.reduce<Record<string, string>>((acc, line) => {
          acc[line.id] = "0";
          return acc;
        }, {})
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch sales order."
      );
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const pendingLines = useMemo(
    () =>
      lines.filter(
        (line) =>
          Number(line.quantityOrdered) - Number(line.quantityDelivered) > 0.0001
      ),
    [lines]
  );

  const handleConfirm = async () => {
    if (!orderId) return;
    setIsProcessing(true);
    try {
      await salesOrderService.confirm(orderId);
      await loadOrder();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to confirm sales order."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeliver = async () => {
    if (!orderId) return;

    const payloadLines = Object.entries(quantities)
      .map(([lineId, quantity]) => ({
        lineId,
        quantity: Number(quantity),
      }))
      .filter((line) => line.quantity > 0);

    if (payloadLines.length === 0) {
      setError("Enter at least one quantity to deliver.");
      return;
    }

    setIsProcessing(true);
    try {
      await salesOrderService.deliver({
        orderId,
        warehouseId: deliverWarehouseId || undefined,
        note: deliverNote || undefined,
        lines: payloadLines,
      });
      setDeliverNote("");
      setQuantities((prev) =>
        Object.keys(prev).reduce<Record<string, string>>((acc, key) => {
          acc[key] = "0";
          return acc;
        }, {})
      );
      await loadOrder();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to deliver products."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner label="Loading sales order..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-medium border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-600">
          {error}
        </div>
        <Button
          as={LinkAs as any}
          size="sm"
          variant="light"
          href="/workspace/modules/sale"
        >
          Back to list
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <p className="text-default-500">Sales order not found.</p>
        <Button
          as={LinkAs as any}
          size="sm"
          variant="light"
          href="/workspace/modules/sale"
        >
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sales Order {order.code}</h1>
          <p className="text-default-500">
            Customer: <strong>{order.customerName}</strong>
          </p>
        </div>
        <Button
          as={LinkAs as any}
          size="sm"
          variant="light"
          href="/workspace/modules/sale"
        >
          Back to list
        </Button>
      </div>

      <Card>
        <CardBody className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Chip variant="flat" color="primary">
              Status: {order.status}
            </Chip>
            <Chip variant="flat">
              Expected:{" "}
              {order.expectedDate
                ? new Date(order.expectedDate).toLocaleDateString()
                : "—"}
            </Chip>
            <Chip variant="flat">
              Total:{" "}
              {Number(order.totalAmount || 0).toLocaleString(undefined, {
                style: "currency",
                currency: order.currency || "USD",
              })}
            </Chip>
          </div>
          {order.notes ? (
            <p className="text-default-500">Notes: {order.notes}</p>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-lg font-semibold">Lines</h2>
          <Table aria-label="Sales order lines" removeWrapper>
            <TableHeader>
              <TableColumn>Product</TableColumn>
              <TableColumn>Description</TableColumn>
              <TableColumn>Ordered</TableColumn>
              <TableColumn>Delivered</TableColumn>
              <TableColumn>Unit Price</TableColumn>
            </TableHeader>
            <TableBody>
              {lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>{line.productId}</TableCell>
                  <TableCell>{line.description || "—"}</TableCell>
                  <TableCell>{Number(line.quantityOrdered).toFixed(2)}</TableCell>
                  <TableCell>
                    {Number(line.quantityDelivered).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {Number(line.unitPrice).toLocaleString(undefined, {
                      style: "currency",
                      currency: order.currency || "USD",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

  <div className="flex items-center gap-3">
        <Button
          color="primary"
          size="sm"
          onPress={handleConfirm}
          isDisabled={order.status !== "draft"}
          isLoading={isProcessing}
        >
          Confirm order
        </Button>
        <Button
          size="sm"
          variant="light"
          onPress={() => router.push("/workspace/modules/stock")}
        >
          Go to stock dashboard
        </Button>
      </div>

      <Divider />

      <Card>
        <CardBody className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Deliver products</h2>
            <p className="text-default-500">
              Issue products from inventory to fulfill this sales order.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <HeroInput
              label="Warehouse"
              placeholder="Warehouse ID"
              value={deliverWarehouseId}
              onValueChange={setDeliverWarehouseId}
            />
            <Textarea
              label="Note"
              placeholder="Optional delivery note"
              value={deliverNote}
              onValueChange={setDeliverNote}
            />
          </div>

          {pendingLines.length === 0 ? (
            <p className="text-default-500">
              All lines have been delivered.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingLines.map((line) => {
                const openQty =
                  Number(line.quantityOrdered) - Number(line.quantityDelivered);
                return (
                  <div
                    key={line.id}
                    className="grid gap-3 rounded-medium border border-content3/50 p-3 md:grid-cols-4"
                  >
                    <div>
                      <p className="font-medium">{line.productId}</p>
                      <p className="text-xs text-default-500">
                        Remaining: {openQty.toFixed(2)}
                      </p>
                    </div>
                    <HeroInput
                      label="Quantity to deliver"
                      type="number"
                      value={quantities[line.id] ?? "0"}
                      min={0}
                      max={openQty}
                      onValueChange={(value) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [line.id]: value,
                        }))
                      }
                    />
                    <HeroInput
                      label="Description"
                      value={line.description ?? ""}
                      isReadOnly
                    />
                    <HeroInput
                      label="Ordered / Delivered"
                      value={`${Number(line.quantityOrdered).toFixed(
                        2
                      )} / ${Number(line.quantityDelivered).toFixed(2)}`}
                      isReadOnly
                    />
                  </div>
                );
              })}
            </div>
          )}

          <Button
            color="primary"
            onPress={handleDeliver}
            isDisabled={pendingLines.length === 0}
            isLoading={isProcessing}
          >
            Deliver selected quantities
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

