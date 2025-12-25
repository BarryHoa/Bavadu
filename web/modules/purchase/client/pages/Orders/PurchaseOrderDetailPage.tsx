"use client";

import { IBaseInput } from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { Button } from "@base/client";
import {
  Card,
  CardBody,
  Chip,
  Divider,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@base/client";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  PurchaseOrderDto,
  PurchaseOrderLineDto,
  purchaseOrderService,
} from "../../services/PurchaseOrderService";

export default function PurchaseOrderDetailPage(): React.ReactNode {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [receiveNote, setReceiveNote] = useState("");
  const [receiveWarehouseId, setReceiveWarehouseId] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [localError, setLocalError] = useState<string | null>(null);

  const orderQuery = useQuery({
    queryKey: ["purchaseOrder", orderId],
    enabled: Boolean(orderId),
    queryFn: async () => {
      if (!orderId) {
        throw new Error("Purchase order identifier is missing.");
      }

      const response = await purchaseOrderService.getById(orderId);

      if (!response.data) {
        throw new Error("Failed to fetch purchase order.");
      }

      return response.data;
    },
  });

  const order = orderQuery.data?.order ?? null;
  const lines = orderQuery.data?.lines ?? [];

  useEffect(() => {
    if (!order || lines.length === 0) {
      return;
    }

    setReceiveWarehouseId(order.warehouseId ?? "");
    setQuantities(
      lines.reduce<Record<string, string>>((acc, line) => {
        acc[line.id] = "0";

        return acc;
      }, {}),
    );
  }, [order?.id, order?.warehouseId, lines]);

  const pendingLines = useMemo(
    () =>
      lines.filter(
        (line) =>
          Number(line.quantityOrdered) - Number(line.quantityReceived) > 0.0001,
      ),
    [lines],
  );

  const {
    handleSubmit: confirmOrder,
    isPending: isConfirming,
    error: confirmError,
  } = useCreateUpdate<string, PurchaseOrderDto>({
    mutationFn: async (id) => {
      const response = await purchaseOrderService.confirm(id);

      if (!response.data) {
        throw new Error("Failed to confirm purchase order.");
      }

      return response.data;
    },
    invalidateQueries: [["purchaseOrder", orderId], ["purchaseOrders"]],
    onSuccess: () => {
      orderQuery.refetch();
    },
  });

  const {
    handleSubmit: receiveOrder,
    isPending: isReceiving,
    error: receiveError,
  } = useCreateUpdate<
    {
      orderId: string;
      warehouseId?: string;
      note?: string;
      lines: Array<{ lineId: string; quantity: number }>;
    },
    { order: PurchaseOrderDto; lines: PurchaseOrderLineDto[] }
  >({
    mutationFn: async (payload) => {
      const response = await purchaseOrderService.receive(payload);

      if (!response.data) {
        throw new Error("Failed to receive products.");
      }

      return response.data;
    },
    invalidateQueries: [["purchaseOrder", orderId], ["purchaseOrders"]],
    onSuccess: () => {
      setReceiveNote("");
      setLocalError(null);
      orderQuery.refetch();
    },
  });

  const actionError = confirmError ?? receiveError ?? localError;

  if (!orderId) {
    return (
      <div className="space-y-4">
        <div className="rounded-medium border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-600">
          Purchase order identifier is missing.
        </div>
        <Button
          as={LinkAs as any}
          href="/workspace/modules/purchase"
          size="sm"
          variant="light"
        >
          Back to list
        </Button>
      </div>
    );
  }

  if (orderQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner label="Loading purchase order..." />
      </div>
    );
  }

  if (orderQuery.isError) {
    return (
      <div className="space-y-4">
        <div className="rounded-medium border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-600">
          {orderQuery.error instanceof Error
            ? orderQuery.error.message
            : "Failed to fetch purchase order."}
        </div>
        <Button
          as={LinkAs as any}
          href="/workspace/modules/purchase"
          size="sm"
          variant="light"
        >
          Back to list
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <p className="text-default-500">Purchase order not found.</p>
        <Button
          as={LinkAs as any}
          href="/workspace/modules/purchase"
          size="sm"
          variant="light"
        >
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          as={LinkAs as any}
          href="/workspace/modules/purchase"
          size="sm"
          variant="light"
        >
          Back to list
        </Button>
      </div>

      {actionError ? (
        <div className="rounded-medium border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-600">
          {actionError}
        </div>
      ) : null}

      <Card>
        <CardBody className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Chip color="primary" variant="flat">
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
            <Chip variant="flat">Vendor: {order.vendorName}</Chip>
          </div>
          {order.notes ? (
            <p className="text-default-500">Notes: {order.notes}</p>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-lg font-semibold">Lines</h2>
          <Table removeWrapper aria-label="Purchase order lines">
            <TableHeader>
              <TableColumn>Product</TableColumn>
              <TableColumn>Description</TableColumn>
              <TableColumn>Ordered</TableColumn>
              <TableColumn>Received</TableColumn>
              <TableColumn>Unit Price</TableColumn>
            </TableHeader>
            <TableBody>
              {lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>{line.productId}</TableCell>
                  <TableCell>{line.description || "—"}</TableCell>
                  <TableCell>
                    {Number(line.quantityOrdered).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {Number(line.quantityReceived).toFixed(2)}
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
          isDisabled={order.status !== "draft"}
          isLoading={isConfirming}
          size="sm"
          onPress={() => confirmOrder(orderId)}
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
            <h2 className="text-lg font-semibold">Receive products</h2>
            <p className="text-default-500">
              Record products received from the vendor. Enter only the
              quantities being received now.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <IBaseInput
              label="Warehouse"
              placeholder="Warehouse ID (fallback to order warehouse)"
              value={receiveWarehouseId}
              onValueChange={setReceiveWarehouseId}
            />
            <IBaseInput
              label="Reference"
              placeholder="Optional reference"
              value={receiveNote}
              onValueChange={setReceiveNote}
            />
          </div>

          {pendingLines.length === 0 ? (
            <p className="text-default-500">
              All lines have been fully received.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingLines.map((line) => {
                const openQty =
                  Number(line.quantityOrdered) - Number(line.quantityReceived);

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
                    <IBaseInput
                      label="Quantity to receive"
                      max={openQty}
                      min={0}
                      type="number"
                      value={quantities[line.id] ?? "0"}
                      onValueChange={(value: string) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [line.id]: value,
                        }))
                      }
                    />
                    <IBaseInput
                      isReadOnly
                      label="Description"
                      value={line.description ?? ""}
                    />
                    <IBaseInput
                      isReadOnly
                      label="Ordered / Received"
                      value={`${Number(line.quantityOrdered).toFixed(
                        2,
                      )} / ${Number(line.quantityReceived).toFixed(2)}`}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <Button
            color="primary"
            isDisabled={pendingLines.length === 0}
            isLoading={isReceiving}
            onPress={async () => {
              if (!orderId) return;

              const payloadLines = Object.entries(quantities)
                .map(([lineId, quantity]) => ({
                  lineId,
                  quantity: Number(quantity),
                }))
                .filter((line) => line.quantity > 0);

              if (payloadLines.length === 0) {
                setLocalError("Enter at least one quantity to receive.");

                return;
              }

              await receiveOrder({
                orderId,
                warehouseId: receiveWarehouseId || undefined,
                note: receiveNote || undefined,
                lines: payloadLines,
              });
            }}
          >
            Receive selected quantities
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
