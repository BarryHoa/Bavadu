"use client";

import Input from "@base/client/components/Input";
import LinkAs from "@base/client/components/LinkAs";
import Select, { SelectItem } from "@base/client/components/Select";
import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { Button } from "@heroui/button";
import { Card, CardBody, Textarea } from "@heroui/react";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import {
  array,
  custom,
  minLength,
  object,
  optional,
  pipe,
  string,
  trim,
} from "valibot";

import StockService from "@mdl/stock/client/services/StockService";
import { purchaseOrderService } from "../../services/PurchaseOrderService";

const quantitySchema = pipe(
  string(),
  trim(),
  minLength(1, "Quantity is required"),
  custom(
    (value) => !Number.isNaN(Number(value)) && Number(value) > 0,
    "Quantity must be a positive number"
  )
);

const unitPriceSchema = pipe(
  string(),
  trim(),
  custom(
    (value) =>
      value === "" ||
      (!Number.isNaN(Number(value)) && Number(value) >= 0),
    "Unit price must be a number greater than or equal to 0"
  )
);

const orderLineSchema = object({
  productId: pipe(
    string(),
    trim(),
    minLength(1, "Product ID is required")
  ),
  quantity: quantitySchema,
  unitPrice: unitPriceSchema,
  description: optional(pipe(string(), trim())),
});

const purchaseOrderFormSchema = object({
  vendorName: pipe(
    string(),
    trim(),
    minLength(1, "Vendor name is required")
  ),
  warehouseId: optional(pipe(string(), trim())),
  expectedDate: optional(pipe(string(), trim())),
  currency: pipe(string(), trim(), minLength(1, "Currency is required")),
  notes: optional(pipe(string(), trim())),
  lines: pipe(
    array(orderLineSchema),
    minLength(1, "At least one order line is required")
  ),
});

type PurchaseOrderFormValues = {
  vendorName: string;
  warehouseId?: string;
  expectedDate?: string;
  currency: string;
  notes?: string;
  lines: Array<{
    productId: string;
    quantity: string;
    unitPrice: string;
    description?: string;
  }>;
};

const defaultLine: PurchaseOrderFormValues["lines"][number] = {
  productId: "",
  quantity: "",
  unitPrice: "",
  description: "",
};

export default function PurchaseOrderCreatePage(): React.ReactNode {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseOrderFormValues>({
    resolver: valibotResolver(purchaseOrderFormSchema),
    defaultValues: {
      vendorName: "",
      warehouseId: "",
      expectedDate: "",
      currency: "USD",
      notes: "",
      lines: [defaultLine],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

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

  const { handleSubmit: submitOrder, error: submitError } = useCreateUpdate<
    {
      vendorName: string;
      warehouseId?: string;
      expectedDate?: string;
      currency?: string;
      notes?: string;
      lines: Array<{
        productId: string;
        quantity: number;
        unitPrice?: number;
        description?: string;
      }>;
    },
    {
      order: { id: string };
    }
  >({
    mutationFn: async (payload) => {
      const response = await purchaseOrderService.create(payload);
      if (!response.success || !response.data) {
        throw new Error(response.message ?? "Failed to create purchase order.");
      }

      return response.data;
    },
    invalidateQueries: [["purchaseOrders"]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/purchase/view/${data.order.id}`);
    },
  });

  const onSubmit: SubmitHandler<PurchaseOrderFormValues> = async (values) => {
    const payload = {
      vendorName: values.vendorName.trim(),
      warehouseId: values.warehouseId?.trim() || undefined,
      expectedDate: values.expectedDate?.trim() || undefined,
      currency: values.currency.trim(),
      notes: values.notes?.trim() || undefined,
      lines: values.lines
        .map((line) => ({
          productId: line.productId.trim(),
          quantity: Number(line.quantity),
          unitPrice: line.unitPrice ? Number(line.unitPrice) : undefined,
          description: line.description?.trim() || undefined,
        }))
        .filter((line) => line.productId && line.quantity > 0),
    };

    await submitOrder(payload);
  };

  const warehouseOptions = useMemo(
    () =>
      (warehousesQuery.data ?? []).map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.code} — ${warehouse.name}`,
      })),
    [warehousesQuery.data]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
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
          {submitError ? (
            <div className="mb-4 rounded-large border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-600">
              {submitError}
            </div>
          ) : null}
          {warehousesQuery.isError ? (
            <div className="mb-4 rounded-large border border-warning-200 bg-warning-50 px-3 py-2 text-sm text-warning-600">
              {warehousesQuery.error instanceof Error
                ? warehousesQuery.error.message
                : "Unable to load warehouses. You can continue without selecting one."}
            </div>
          ) : null}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="vendorName"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    value={field.value}
                    onValueChange={field.onChange}
                    label="Vendor name"
                    isRequired
                    isInvalid={fieldState.invalid}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="warehouseId"
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    label="Warehouse (optional)"
                    selectedKeys={
                      field.value ? new Set([field.value]) : new Set<string>()
                    }
                    onSelectionChange={(keys) => {
                      const [first] = Array.from(keys);
                      field.onChange(
                        typeof first === "string" ? first : undefined
                      );
                    }}
                    isInvalid={fieldState.invalid}
                    errorMessage={fieldState.error?.message}
                    isDisabled={warehousesQuery.isLoading}
                  >
                    {warehouseOptions.map((option) => (
                      <SelectItem key={option.value}>{option.label}</SelectItem>
                    ))}
                  </Select>
                )}
              />
              <Controller
                name="expectedDate"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    type="date"
                    label="Expected date"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    isInvalid={fieldState.invalid}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="currency"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Currency"
                    value={field.value}
                    onValueChange={field.onChange}
                    isInvalid={fieldState.invalid}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <Controller
              name="notes"
              control={control}
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  label="Notes"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Order lines</h2>
                <Button
                  size="sm"
                  variant="bordered"
                  onPress={() => append(defaultLine)}
                >
                  Add line
                </Button>
              </div>

              {fields.map((fieldItem, index) => (
                <Card key={fieldItem.id} className="border border-content3/40">
                  <CardBody className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-4">
                      <Controller
                        name={`lines.${index}.productId`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Input
                            {...field}
                            label="Product ID"
                            value={field.value}
                            onValueChange={field.onChange}
                            isRequired
                            isInvalid={fieldState.invalid}
                            errorMessage={fieldState.error?.message}
                          />
                        )}
                      />
                      <Controller
                        name={`lines.${index}.quantity`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Input
                            {...field}
                            label="Quantity"
                            type="number"
                            value={field.value}
                            onValueChange={field.onChange}
                            isRequired
                            isInvalid={fieldState.invalid}
                            errorMessage={fieldState.error?.message}
                          />
                        )}
                      />
                      <Controller
                        name={`lines.${index}.unitPrice`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Input
                            {...field}
                            label="Unit price"
                            type="number"
                            value={field.value}
                            onValueChange={field.onChange}
                            isInvalid={fieldState.invalid}
                            errorMessage={fieldState.error?.message}
                          />
                        )}
                      />
                      <Controller
                        name={`lines.${index}.description`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Input
                            {...field}
                            label="Description"
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                            isInvalid={fieldState.invalid}
                            errorMessage={fieldState.error?.message}
                          />
                        )}
                      />
                    </div>
                    {fields.length > 1 ? (
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => remove(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : null}
                  </CardBody>
                </Card>
              ))}
              {errors.lines?.message ? (
                <p className="text-sm text-danger-600">
                  {errors.lines.message as string}
                </p>
              ) : null}
            </div>

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

