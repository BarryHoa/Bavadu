"use client";

import Input from "@base/client/components/Input";
import LinkAs from "@base/client/components/LinkAs";
import { Button } from "@heroui/button";
import {
  Card,
  CardBody,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import StockService, {
  WarehouseDto,
} from "@mdl/stock/client/services/StockService";
import { purchaseOrderService } from "../../services/PurchaseOrderService";

interface OrderLineForm {
  productId: string;
  quantity: string;
  unitPrice: string;
  description: string;
}

export default function PurchaseOrderCreatePage(): React.ReactNode {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    vendorName: "",
    warehouseId: "",
    expectedDate: "",
    currency: "USD",
    notes: "",
  });
  const [lines, setLines] = useState<OrderLineForm[]>([
    { productId: "", quantity: "", unitPrice: "", description: "" },
  ]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await StockService.listWarehouses();
        setWarehouses(response.data ?? []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWarehouses();
  }, []);

  const handleLineChange = (
    index: number,
    field: keyof OrderLineForm,
    value: string
  ) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { productId: "", quantity: "", unitPrice: "", description: "" },
    ]);
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.vendorName.trim()) {
      setError("Vendor name is required.");
      return;
    }

    const preparedLines = lines
      .map((line) => ({
        productId: line.productId.trim(),
        quantity: Number(line.quantity),
        unitPrice: line.unitPrice ? Number(line.unitPrice) : undefined,
        description: line.description.trim() || undefined,
      }))
      .filter((line) => line.productId && line.quantity > 0);

    if (preparedLines.length === 0) {
      setError("At least one valid order line is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await purchaseOrderService.create({
        vendorName: form.vendorName,
        warehouseId: form.warehouseId || undefined,
        expectedDate: form.expectedDate || undefined,
        currency: form.currency || undefined,
        notes: form.notes || undefined,
        lines: preparedLines,
      });

      const newlyCreatedId = response.data.order.id;
      router.push(`/workspace/modules/purchase/view/${newlyCreatedId}`);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to create purchase order."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">New Purchase Order</h1>
          <p className="text-default-500">
            Capture vendor information and the products to be procured.
          </p>
        </div>
        <Button
          as={LinkAs as any}
          size="sm"
          variant="light"
          href="/workspace/modules/purchase"
        >
          Back to list
        </Button>
      </div>

      <Card>
        <CardBody>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Vendor name"
                value={form.vendorName}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, vendorName: value }))
                }
                isRequired
              />
              <Select
                label="Warehouse (optional)"
                selectedKeys={
                  form.warehouseId
                    ? new Set([form.warehouseId])
                    : new Set<string>()
                }
                onSelectionChange={(keys) => {
                  const [first] = Array.from(keys);
                  setForm((prev) => ({
                    ...prev,
                    warehouseId: typeof first === "string" ? first : "",
                  }));
                }}
              >
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id}>
                    {warehouse.code} — {warehouse.name}
                  </SelectItem>
                ))}
              </Select>
              <Input
                label="Expected date"
                type="date"
                value={form.expectedDate}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, expectedDate: value }))
                }
              />
              <Input
                label="Currency"
                value={form.currency}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, currency: value }))
                }
              />
            </div>

            <Textarea
              label="Notes"
              value={form.notes}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, notes: value }))
              }
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Order lines</h2>
                <Button size="sm" variant="bordered" onPress={addLine}>
                  Add line
                </Button>
              </div>

              {lines.map((line, index) => (
                <Card key={index} className="border border-content3/40">
                  <CardBody className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-4">
                      <Input
                        label="Product ID"
                        value={line.productId}
                        onValueChange={(value) =>
                          handleLineChange(index, "productId", value)
                        }
                        isRequired
                      />
                      <Input
                        label="Quantity"
                        type="number"
                        value={line.quantity}
                        onValueChange={(value) =>
                          handleLineChange(index, "quantity", value)
                        }
                        isRequired
                      />
                      <Input
                        label="Unit price"
                        type="number"
                        value={line.unitPrice}
                        onValueChange={(value) =>
                          handleLineChange(index, "unitPrice", value)
                        }
                      />
                      <Input
                        label="Description"
                        value={line.description}
                        onValueChange={(value) =>
                          handleLineChange(index, "description", value)
                        }
                      />
                    </div>
                    {lines.length > 1 ? (
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => removeLine(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : null}
                  </CardBody>
                </Card>
              ))}
            </div>

            {error ? (
              <div className="rounded-medium border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-600">
                {error}
              </div>
            ) : null}

            <Button
              color="primary"
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Create purchase order
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

