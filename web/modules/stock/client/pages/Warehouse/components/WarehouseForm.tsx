import Input from "@base/client/components/Input";
import { Button } from "@heroui/button";
import { Card, CardBody, Select, SelectItem, Textarea } from "@heroui/react";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { type Key, type ReactNode, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  minLength,
  object,
  optional,
  picklist,
  pipe,
  string,
  trim,
} from "valibot";

import {
  warehouseStatuses,
  warehouseValuationMethods,
} from "../../../../common/constants";
import { WarehouseDto, WarehousePayload } from "../../../services/StockService";

const warehouseFormSchema = object({
  code: pipe(string(), trim(), minLength(1, "Code is required")),
  name: pipe(string(), trim(), minLength(1, "Name is required")),
  typeCode: pipe(string(), trim(), minLength(1, "Type code is required")),
  status: pipe(
    string(),
    trim(),
    picklist(warehouseStatuses, "Invalid warehouse status")
  ),
  companyId: optional(pipe(string(), trim())),
  managerId: optional(pipe(string(), trim())),
  contactId: optional(pipe(string(), trim())),
  address: object({
    line1: pipe(string(), trim(), minLength(1, "Address line 1 is required")),
    line2: optional(pipe(string(), trim())),
    city: pipe(string(), trim(), minLength(1, "City is required")),
    state: optional(pipe(string(), trim())),
    postalCode: optional(pipe(string(), trim())),
    country: pipe(string(), trim(), minLength(1, "Country is required")),
  }),
  valuationMethod: pipe(
    string(),
    trim(),
    picklist(warehouseValuationMethods, "Invalid valuation method")
  ),
  minStock: optional(pipe(string(), trim())),
  maxStock: optional(pipe(string(), trim())),
  accountInventory: optional(pipe(string(), trim())),
  accountAdjustment: optional(pipe(string(), trim())),
  notes: optional(pipe(string(), trim())),
});

type WarehouseFormValues = Input<typeof warehouseFormSchema>;

const statusOptions = warehouseStatuses.map((status) => ({
  value: status,
  label: status.charAt(0) + status.slice(1).toLowerCase(),
}));

const valuationOptions = warehouseValuationMethods.map((method) => ({
  value: method,
  label: method,
}));

const toNullableString = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const toNullableNumber = (value?: string) => {
  if (!value || value.trim().length === 0) {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error("Invalid number");
  }
  return numeric;
};

type SingleSelection = "all" | Set<Key>;

const getSingleSelectionValue = (selection: SingleSelection) => {
  if (selection === "all") {
    return undefined;
  }
  const [first] = Array.from(selection);
  return typeof first === "string" ? first : undefined;
};

interface WarehouseFormProps {
  initialData?: WarehouseDto;
  onSubmit: (payload: WarehousePayload) => Promise<void>;
  submitLabel: string;
  secondaryAction?: ReactNode;
}

export default function WarehouseForm({
  initialData,
  onSubmit,
  submitLabel,
  secondaryAction,
}: WarehouseFormProps) {
  const defaultValues: WarehouseFormValues = useMemo(
    () => ({
      code: initialData?.code ?? "",
      name: initialData?.name ?? "",
      typeCode: initialData?.typeCode ?? "",
      status: initialData?.status ?? "ACTIVE",
      companyId: initialData?.companyId ?? "",
      managerId: initialData?.managerId ?? "",
      contactId: initialData?.contactId ?? "",
      address: {
        line1: initialData?.address.line1 ?? "",
        line2: initialData?.address.line2 ?? "",
        city: initialData?.address.city ?? "",
        state: initialData?.address.state ?? "",
        postalCode: initialData?.address.postalCode ?? "",
        country: initialData?.address.country ?? "",
      },
      valuationMethod: initialData?.valuationMethod ?? "FIFO",
      minStock:
        initialData?.minStock !== undefined
          ? String(initialData.minStock ?? 0)
          : "0",
      maxStock:
        initialData?.maxStock !== undefined && initialData?.maxStock !== null
          ? String(initialData.maxStock)
          : undefined,
      accountInventory: initialData?.accountInventory ?? "",
      accountAdjustment: initialData?.accountAdjustment ?? "",
      notes: initialData?.notes ?? "",
    }),
    [initialData]
  );

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<WarehouseFormValues>({
    resolver: valibotResolver(warehouseFormSchema),
    defaultValues,
  });

  const handleFormSubmit = async (values: WarehouseFormValues) => {
    let minStock = 0;
    if (values.minStock !== undefined) {
      try {
        minStock = toNullableNumber(values.minStock) ?? 0;
      } catch (error) {
        setError("minStock", {
          type: "manual",
          message: error instanceof Error ? error.message : "Invalid value",
        });
        return;
      }
    }

    let maxStock: number | null = null;
    if (values.maxStock !== undefined) {
      try {
        maxStock = toNullableNumber(values.maxStock);
      } catch (error) {
        setError("maxStock", {
          type: "manual",
          message: error instanceof Error ? error.message : "Invalid value",
        });
        return;
      }
    }

    if (maxStock !== null && maxStock < minStock) {
      setError("maxStock", {
        type: "manual",
        message: "Max stock must be greater than or equal to min stock",
      });
      return;
    }

    const payload: WarehousePayload = {
      code: values.code.trim(),
      name: values.name.trim(),
      typeCode: values.typeCode.trim(),
      status: values.status.toUpperCase(),
      companyId: toNullableString(values.companyId) ?? null,
      managerId: toNullableString(values.managerId) ?? null,
      contactId: toNullableString(values.contactId) ?? null,
      address: {
        line1: values.address.line1.trim(),
        line2: toNullableString(values.address.line2) ?? null,
        city: values.address.city.trim(),
        state: toNullableString(values.address.state) ?? null,
        postalCode: toNullableString(values.address.postalCode) ?? null,
        country: values.address.country.trim(),
      },
      valuationMethod: values.valuationMethod.toUpperCase(),
      minStock,
      maxStock,
      accountInventory: toNullableString(values.accountInventory) ?? null,
      accountAdjustment: toNullableString(values.accountAdjustment) ?? null,
      notes: toNullableString(values.notes) ?? null,
    };

    await onSubmit(payload);
  };

  return (
    <Card>
      <CardBody>
        <form
          className="space-y-6"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="code"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Code"
                  placeholder="Unique warehouse code"
                  value={field.value}
                  onValueChange={field.onChange}
                  isRequired
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Name"
                  placeholder="Warehouse name"
                  value={field.value}
                  onValueChange={field.onChange}
                  isRequired
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="typeCode"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Type"
                  placeholder="e.g. RAW_MATERIAL, FINISHED_GOODS"
                  value={field.value}
                  onValueChange={field.onChange}
                  isRequired
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <Select
                  label="Status"
                  selectedKeys={new Set([field.value])}
                  onSelectionChange={(keys) => {
                    const value = getSingleSelectionValue(
                      keys as SingleSelection
                    );
                    if (value) {
                      field.onChange(value);
                    }
                  }}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  isRequired
                >
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  ))}
                </Select>
              )}
            />
            <Controller
              name="valuationMethod"
              control={control}
              render={({ field, fieldState }) => (
                <Select
                  label="Valuation method"
                  selectedKeys={new Set([field.value])}
                  onSelectionChange={(keys) => {
                    const value = getSingleSelectionValue(
                      keys as SingleSelection
                    );
                    if (value) {
                      field.onChange(value);
                    }
                  }}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  isRequired
                >
                  {valuationOptions.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  ))}
                </Select>
              )}
            />
            <Controller
              name="companyId"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Company ID"
                  placeholder="Optional company relationship"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="managerId"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Manager (user ID)"
                  placeholder="Optional manager user ID"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="contactId"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Contact (user ID)"
                  placeholder="Optional contact user ID"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Address</h2>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="address.line1"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Address line 1"
                    placeholder="Street, building"
                    value={field.value}
                    onValueChange={field.onChange}
                    isRequired
                    isInvalid={fieldState.invalid}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="address.line2"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Address line 2"
                    placeholder="Suite, block (optional)"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    isInvalid={fieldState.invalid}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="address.city"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="City"
                    value={field.value}
                    onValueChange={field.onChange}
                    isRequired
                    isInvalid={fieldState.invalid}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="address.state"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="State/Province"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    isInvalid={fieldState.invalid}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="address.postalCode"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Postal code"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    isInvalid={fieldState.invalid}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="address.country"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Country"
                    value={field.value}
                    onValueChange={field.onChange}
                    isRequired
                    isInvalid={fieldState.invalid}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Inventory Controls</h2>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="minStock"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Minimum stock"
                    type="number"
                    value={field.value ?? ""}
                    onValueChange={(value) =>
                      field.onChange(value === "" ? undefined : value)
                    }
                    isRequired
                    isInvalid={fieldState.invalid}
                    errorMessage={
                      fieldState.error?.message ?? errors.minStock?.message
                    }
                  />
                )}
              />
              <Controller
                name="maxStock"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Maximum stock"
                    type="number"
                    value={field.value ?? ""}
                    onValueChange={(value) =>
                      field.onChange(value === "" ? undefined : value)
                    }
                    isInvalid={fieldState.invalid}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="accountInventory"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Inventory account"
                    placeholder="Optional account code"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    isInvalid={fieldState.invalid}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="accountAdjustment"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Adjustment account"
                    placeholder="Optional adjustment account"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    isInvalid={fieldState.invalid}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
            </div>
          </div>

          <Controller
            name="notes"
            control={control}
            render={({ field, fieldState }) => (
              <Textarea
                {...field}
                label="Notes"
                placeholder="Internal notes (optional)"
                value={field.value ?? ""}
                onValueChange={field.onChange}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between">
            {secondaryAction && <div>{secondaryAction}</div>}
            <div className="flex gap-3">
              <Button
                type="submit"
                color="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {submitLabel}
              </Button>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
