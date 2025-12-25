"use client";

import {
  IBaseInput,
  IBaseSingleSelect,
  SelectItemOption,
} from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { Button } from "@base/client";
import { Card, CardBody, Textarea } from "@base/client";
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
    "Quantity must be a positive number",
  ),
);

const unitPriceSchema = pipe(
  string(),
  trim(),
  custom(
    (value) =>
      value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0),
    "Unit price must be a number greater than or equal to 0",
  ),
);

const orderLineSchema = object({
  productId: pipe(string(), trim(), minLength(1, "Product ID is required")),
  quantity: quantitySchema,
  unitPrice: unitPriceSchema,
  description: optional(pipe(string(), trim())),
});

const purchaseOrderFormSchema = object({
  vendorName: pipe(string(), trim(), minLength(1, "Vendor name is required")),
  warehouseId: optional(pipe(string(), trim())),
  expectedDate: optional(pipe(string(), trim())),
  currency: pipe(string(), trim(), minLength(1, "Currency is required")),
  notes: optional(pipe(string(), trim())),
  lines: pipe(
    array(orderLineSchema),
    minLength(1, "At least one order line is required"),
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

      if (!response.data) {
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

  const warehouseOptions = useMemo<SelectItemOption[]>(
    () =>
      (warehousesQuery.data ?? []).map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.code} — ${warehouse.name}`,
      })),
    [warehousesQuery.data],
  );

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
                control={control}
                name="vendorName"
                render={({ field, fieldState }) => (
                  <IBaseInput
                    {...field}
                    isRequired
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label="Vendor name"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="warehouseId"
                render={({ field, fieldState }) => (
                  <IBaseSingleSelect
                    errorMessage={fieldState.error?.message}
                    isDisabled={warehousesQuery.isLoading}
                    isInvalid={fieldState.invalid}
                    items={warehouseOptions}
                    label="Warehouse (optional)"
                    selectedKey={field.value}
                    onSelectionChange={(key) => {
                      field.onChange(key || undefined);
                    }}
                  />
                )}
              />
              <Controller
                control={control}
                name="expectedDate"
                render={({ field, fieldState }) => (
                  <IBaseInput
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label="Expected date"
                    type="date"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="currency"
                render={({ field, fieldState }) => (
                  <IBaseInput
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label="Currency"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </div>

            <Controller
              control={control}
              name="notes"
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label="Notes"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
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
                        control={control}
                        name={`lines.${index}.productId`}
                        render={({ field, fieldState }) => (
                          <IBaseInput
                            {...field}
                            isRequired
                            errorMessage={fieldState.error?.message}
                            isInvalid={fieldState.invalid}
                            label="Product ID"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name={`lines.${index}.quantity`}
                        render={({ field, fieldState }) => (
                          <IBaseInput
                            {...field}
                            isRequired
                            errorMessage={fieldState.error?.message}
                            isInvalid={fieldState.invalid}
                            label="Quantity"
                            type="number"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name={`lines.${index}.unitPrice`}
                        render={({ field, fieldState }) => (
                          <IBaseInput
                            {...field}
                            errorMessage={fieldState.error?.message}
                            isInvalid={fieldState.invalid}
                            label="Unit price"
                            type="number"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name={`lines.${index}.description`}
                        render={({ field, fieldState }) => (
                          <IBaseInput
                            {...field}
                            errorMessage={fieldState.error?.message}
                            isInvalid={fieldState.invalid}
                            label="Description"
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
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
              disabled={isSubmitting}
              isLoading={isSubmitting}
              type="submit"
            >
              Create purchase order
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
