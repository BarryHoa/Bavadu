import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import { type ReactNode, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  any,
  minLength,
  object,
  optional,
  picklist,
  pipe,
  string,
  trim,
} from "valibot";

import {
  IBaseButton,
  IBaseInput,
  IBaseSingleSelect,
  IBaseTextarea,
  SelectItemOption,
} from "@base/client";
import AddressPicker from "@base/client/components/AddressPicker/AddressPicker";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { Address } from "@base/client/interface/Address";

import {
  warehouseStatuses,
  warehouseValuationMethods,
} from "../../../../common/constants";
import { WarehouseDto, WarehousePayload } from "../../../services/StockService";

const createWarehouseFormSchema = (t: any) =>
  object({
    code: pipe(
      string(),
      trim(),
      minLength(1, t("fields.code.label") + " is required")
    ),
    name: pipe(
      string(),
      trim(),
      minLength(1, t("fields.name.label") + " is required")
    ),
    typeCode: pipe(
      string(),
      trim(),
      minLength(1, t("fields.type.label") + " is required")
    ),
    status: pipe(
      string(),
      trim(),
      picklist(warehouseStatuses, "Invalid warehouse status")
    ),
    companyId: optional(pipe(string(), trim())),
    managerId: optional(pipe(string(), trim())),
    contactId: optional(pipe(string(), trim())),
    address1: any(), // Address object, validated manually
    address2: optional(any()), // Address object, optional
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

type WarehouseFormValues = {
  code: string;
  name: string;
  typeCode: string;
  status: string;
  companyId?: string;
  managerId?: string;
  contactId?: string;
  address1: Address;
  address2?: Address;
  valuationMethod: string;
  minStock?: string;
  maxStock?: string;
  accountInventory?: string;
  accountAdjustment?: string;
  notes?: string;
};

const statusOptions: SelectItemOption[] = warehouseStatuses.map((status) => ({
  value: status,
  label: status.charAt(0) + status.slice(1).toLowerCase(),
}));

const valuationOptions: SelectItemOption[] = warehouseValuationMethods.map(
  (method) => ({
    value: method,
    label: method,
  })
);

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

interface WarehouseFormProps {
  initialData?: WarehouseDto;
  onSubmit: (payload: WarehousePayload) => Promise<void>;
  submitLabel: string;
  secondaryAction?: ReactNode;
  submitError?: string | null;
}

export default function WarehouseForm({
  initialData,
  onSubmit,
  submitLabel,
  secondaryAction,
  submitError,
}: WarehouseFormProps) {
  const getLocalizedName = useLocalizedText();
  const t = useTranslations("stock.warehouse.form");

  const defaultValues: WarehouseFormValues = {
    code: initialData?.code ?? "",
    name: initialData?.name ?? "",
    typeCode: initialData?.typeCode ?? "",
    status: initialData?.status ?? "ACTIVE",
    companyId: initialData?.companyId ?? "",
    managerId: initialData?.managerId ?? "",
    contactId: initialData?.contactId ?? "",
    address1: initialData?.address?.[0] ?? {
      street: "",
      postalCode: "",
      country: {
        id: "VN",
        name: { vi: "Việt Nam", en: "Vietnam" },
        code: "VN",
      },
      administrativeUnits: [],
      formattedAddress: "",
    },
    address2: initialData?.address?.[1],
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
  };

  const schema = useMemo(() => createWarehouseFormSchema(t), [t]);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<WarehouseFormValues>({
    resolver: valibotResolver(schema),
    defaultValues,
  });

  const handleFormSubmit = async (values: WarehouseFormValues) => {
    // Validate address1
    if (!values.address1 || !values.address1.formattedAddress) {
      setError("address1", {
        type: "manual",
        message: t("errors.addressRequired"),
      });

      return;
    }

    let minStock = 0;

    if (values.minStock !== undefined) {
      try {
        minStock = toNullableNumber(values.minStock) ?? 0;
      } catch {
        setError("minStock", {
          type: "manual",
          message: t("errors.invalidNumber"),
        });

        return;
      }
    }

    let maxStock: number | null = null;

    if (values.maxStock !== undefined) {
      try {
        maxStock = toNullableNumber(values.maxStock);
      } catch {
        setError("maxStock", {
          type: "manual",
          message: t("errors.invalidNumber"),
        });

        return;
      }
    }

    if (maxStock !== null && maxStock < minStock) {
      setError("maxStock", {
        type: "manual",
        message: t("errors.maxStockRange"),
      });

      return;
    }

    const payload: WarehousePayload = {
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      typeCode: values.typeCode.trim(),
      status: values.status.trim().toUpperCase(),
      companyId: toNullableString(values.companyId) ?? null,
      managerId: toNullableString(values.managerId) ?? null,
      contactId: toNullableString(values.contactId) ?? null,
      address: [values.address1, values.address2].filter(
        (x) => x !== undefined
      ) as Address[],
      valuationMethod: values.valuationMethod.trim().toUpperCase(),
      minStock,
      maxStock,
      accountInventory: toNullableString(values.accountInventory) ?? null,
      accountAdjustment: toNullableString(values.accountAdjustment) ?? null,
      notes: toNullableString(values.notes) ?? null,
    };

    await onSubmit(payload);
  };

  return (
    <div className="w-full">
      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        {submitError ? (
          <div
            aria-live="polite"
            className="rounded-xl border-2 border-danger-300 bg-danger-50 px-4 py-3 text-sm font-semibold text-danger-700 shadow-sm"
          >
            {submitError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            control={control}
            name="code"
            render={({ field, fieldState }) => (
              <IBaseInput
                {...field}
                isRequired
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label={t("fields.code.label")}
                placeholder={t("fields.code.placeholder")}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <IBaseInput
                {...field}
                isRequired
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label={t("fields.name.label")}
                placeholder={t("fields.name.placeholder")}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="typeCode"
            render={({ field, fieldState }) => (
              <IBaseInput
                {...field}
                isRequired
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label={t("fields.type.label")}
                placeholder={t("fields.type.placeholder")}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="status"
            render={({ field, fieldState }) => (
              <IBaseSingleSelect
                isRequired
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                items={statusOptions}
                label={t("fields.status.label")}
                selectedKey={field.value}
                onSelectionChange={(key) => {
                  field.onChange(key);
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="valuationMethod"
            render={({ field, fieldState }) => (
              <IBaseSingleSelect
                isRequired
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                items={valuationOptions}
                label={t("fields.valuationMethod.label")}
                selectedKey={field.value}
                onSelectionChange={(key) => {
                  field.onChange(key);
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="companyId"
            render={({ field, fieldState }) => (
              <IBaseInput
                {...field}
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label={t("fields.companyId.label")}
                placeholder={t("fields.companyId.placeholder")}
                value={field.value ?? ""}
                onValueChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="managerId"
            render={({ field, fieldState }) => (
              <IBaseInput
                {...field}
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label={t("fields.managerId.label")}
                placeholder={t("fields.managerId.placeholder")}
                value={field.value ?? ""}
                onValueChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="contactId"
            render={({ field, fieldState }) => (
              <IBaseInput
                {...field}
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label={t("fields.contactId.label")}
                placeholder={t("fields.contactId.placeholder")}
                value={field.value ?? ""}
                onValueChange={field.onChange}
              />
            )}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">
            {t("sections.address")}
          </h2>
          <div className="space-y-4">
            <Controller
              control={control}
              name="address1"
              render={({ field, fieldState }) => (
                <div className="flex gap-2 justify-between items-end">
                  <div className="flex-1">
                    <IBaseInput
                      isDisabled
                      isRequired
                      errorMessage={fieldState.error?.message}
                      isInvalid={fieldState.invalid}
                      label={t("fields.addressMain.label")}
                      placeholder={t("fields.addressMain.placeholder")}
                      value={getLocalizedName(field.value.formattedAddress)}
                    />
                  </div>
                  <AddressPicker
                    value={field.value}
                    onChange={(addressString) => {
                      // AddressPicker returns string, but we need to update the Address object
                      // For now, we'll update the formattedAddress in the existing Address object
                      if (field.value) {
                        field.onChange({
                          ...field.value,
                          formattedAddress: addressString,
                        });
                      }
                    }}
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="address2"
              render={({ field, fieldState }) => (
                <div className="flex gap-2 justify-between items-end">
                  <div className="flex-1">
                    <IBaseInput
                      isDisabled
                      errorMessage={fieldState.error?.message}
                      isInvalid={fieldState.invalid}
                      label={t("fields.addressSecondary.label")}
                      placeholder={t("fields.addressSecondary.placeholder")}
                      value={getLocalizedName(
                        field.value?.formattedAddress ?? ""
                      )}
                    />
                  </div>
                  <AddressPicker
                    value={field.value}
                    onChange={(addressString) => {
                      // AddressPicker returns string, but we need to update the Address object
                      // For now, we'll update the formattedAddress in the existing Address object
                      if (field.value) {
                        field.onChange({
                          ...field.value,
                          formattedAddress: addressString,
                        });
                      }
                    }}
                  />
                </div>
              )}
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            {t("sections.inventoryControls")}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="minStock"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  isRequired
                  errorMessage={
                    fieldState.error?.message ?? errors.minStock?.message
                  }
                  isInvalid={fieldState.invalid}
                  label={t("fields.minStock.label")}
                  type="number"
                  value={field.value ?? ""}
                  onValueChange={(value) =>
                    field.onChange(value === "" ? undefined : value)
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="maxStock"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("fields.maxStock.label")}
                  type="number"
                  value={field.value ?? ""}
                  onValueChange={(value) =>
                    field.onChange(value === "" ? undefined : value)
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="accountInventory"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("fields.accountInventory.label")}
                  placeholder={t("fields.accountInventory.placeholder")}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="accountAdjustment"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("fields.accountAdjustment.label")}
                  placeholder={t("fields.accountAdjustment.placeholder")}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        <Controller
          control={control}
          name="notes"
          render={({ field, fieldState }) => (
            <IBaseTextarea
              {...field}
              errorMessage={fieldState.error?.message}
              isInvalid={fieldState.invalid}
              label={t("fields.notes.label")}
              placeholder={t("fields.notes.placeholder")}
              value={field.value ?? ""}
              onValueChange={field.onChange}
            />
          )}
        />

        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-default-200">
          <IBaseButton
            color="primary"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            size="md"
            type="submit"
          >
            {submitLabel}
          </IBaseButton>
          {secondaryAction && <div>{secondaryAction}</div>}
        </div>
      </form>
    </div>
  );
}
