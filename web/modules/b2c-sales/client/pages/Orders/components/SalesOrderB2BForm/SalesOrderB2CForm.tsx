"use client";

import type { SalesOrderB2CFormValues } from "../../validation/createSalesOrderB2CValidation";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseTextarea,
} from "@base/client";
import { SelectItemOption } from "@base/client/components";
import {
  paymentMethodService,
  shippingMethodService,
  shippingTermService,
  taxRateService,
} from "@base/client/services";
import { valibotResolver } from "@hookform/resolvers/valibot";
import UnitOfMeasureService from "@mdl/product/client/services/UnitOfMeasureService";
import StockService from "@mdl/stock/client/services/StockService";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type SubmitHandler,
} from "react-hook-form";

import { type CustomerIndividualDto } from "../../../../services/CustomerService";
import { createSalesOrderB2CValidation } from "../../validation/createSalesOrderB2CValidation";

import CustomerInfoSection from "./CustomerInfoSection";
import DeliveryInfoSection from "./DeliveryInfoSection";
import GeneralInfoSection from "./GeneralInfoSection";
import OrderLinesSection from "./OrderLinesSection";
import OrderTotalsSection from "./OrderTotalsSection";

// Re-export for backward compatibility
export type { SalesOrderB2CFormValues };

interface SalesOrderB2CFormProps {
  onSubmit: (values: SalesOrderB2CFormValues) => Promise<void>;
  onCancel?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
  defaultValues?: Partial<SalesOrderB2CFormValues>;
}

export default function SalesOrderB2CForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
}: SalesOrderB2CFormProps) {
  const tValidateion = useTranslations("b2cSales.order.create.validation");
  // const t = useTranslations("b2cSales.order.create.validation");
  const tLabels = useTranslations("b2cSales.order.create.labels");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerIndividualDto | null>(null);

  // Create validation schemas with translation
  const validation = useMemo(
    () => createSalesOrderB2CValidation(tValidateion),
    [tValidateion],
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SalesOrderB2CFormValues>({
    resolver: valibotResolver(validation.salesOrderB2CFormSchema) as any,
    defaultValues: {
      lines: [validation.defaultLine],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const watchedLines = watch("lines");
  const watchedPriceListId = watch("priceListId");
  const watchedCurrency = watch("currency");
  const watchedShippingMethodId = watch("shippingMethodId");
  const watchedTotalDiscount = watch("totalDiscount") || "0";
  const watchedTotalTax = watch("totalTax") || "0";
  const watchedShippingFee = watch("shippingFee") || "0";

  // Calculate totals
  const calculatedTotals = useMemo(() => {
    let subtotal = 0;
    let totalLineDiscount = 0;
    let totalLineTax = 0;

    watchedLines.forEach((line) => {
      const quantity = Number(line.quantity) || 0;
      const unitPrice = Number(line.unitPrice) || 0;
      const lineDiscount = Number(line.lineDiscount) || 0;
      const taxRate = Number(line.taxRate) || 0;

      const lineSubtotal = quantity * unitPrice;
      const lineTax = ((lineSubtotal - lineDiscount) * taxRate) / 100;

      subtotal += lineSubtotal;
      totalLineDiscount += lineDiscount;
      totalLineTax += lineTax;
    });

    const orderDiscount = Number(watchedTotalDiscount) || 0;
    const orderTax = Number(watchedTotalTax) || 0;
    const shipping = Number(watchedShippingFee) || 0;

    const grandTotal =
      subtotal -
      totalLineDiscount -
      orderDiscount +
      totalLineTax +
      orderTax +
      shipping;

    return {
      subtotal,
      totalLineDiscount,
      totalLineTax,
      orderDiscount,
      orderTax,
      shipping,
      grandTotal,
    };
  }, [watchedLines, watchedTotalDiscount, watchedTotalTax, watchedShippingFee]);

  // Load master data
  const warehousesQuery = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const response = await StockService.listWarehouses();

      // Filter only internal warehouses
      return (response.data ?? []).filter(
        (wh) =>
          wh.typeCode?.toUpperCase() === "INTERNAL" ||
          wh.typeCode?.toUpperCase().includes("INTERNAL"),
      );
    },
  });

  const paymentMethodsQuery = useQuery({
    queryKey: ["payment-methods-dropdown"],
    queryFn: async () => {
      const response = await paymentMethodService.getOptionsDropdown();

      return response.data ?? [];
    },
  });

  const shippingMethodsQuery = useQuery({
    queryKey: ["shipping-methods-dropdown"],
    queryFn: async () => {
      const response = await shippingMethodService.getOptionsDropdown();

      return response.data ?? [];
    },
  });

  const shippingTermsQuery = useQuery({
    queryKey: ["shipping-terms-dropdown"],
    queryFn: async () => {
      const response = await shippingTermService.getOptionsDropdown();

      return response.data ?? [];
    },
  });

  const taxRatesQuery = useQuery({
    queryKey: ["tax-rates-dropdown"],
    queryFn: async () => {
      const response = await taxRateService.getOptionsDropdown();

      return response.data ?? [];
    },
  });

  const uomQuery = useQuery({
    queryKey: ["units-of-measure"],
    queryFn: async () => {
      const response = await UnitOfMeasureService.getList();

      return response.data ?? [];
    },
  });

  // Find default payment method (Cash/Tiền mặt)
  const defaultPaymentMethod = useMemo(() => {
    if (!paymentMethodsQuery.data) return undefined;

    return paymentMethodsQuery.data.find(
      (pm) =>
        pm.code?.toLowerCase().includes("cash") ||
        (typeof pm.name === "object" &&
          (pm.name.vi?.toLowerCase().includes("tiền mặt") ||
            pm.name.en?.toLowerCase().includes("cash"))) ||
        (typeof pm.name === "string" && pm.name.toLowerCase().includes("cash")),
    );
  }, [paymentMethodsQuery.data]);

  // Find default shipping method (Pickup/Tự nhận)
  const defaultShippingMethod = useMemo(() => {
    if (!shippingMethodsQuery.data) return undefined;

    return shippingMethodsQuery.data.find(
      (sm) =>
        sm.code?.toLowerCase().includes("pickup") ||
        (typeof sm.name === "object" &&
          (sm.name.vi?.toLowerCase().includes("tự nhận") ||
            sm.name.en?.toLowerCase().includes("pickup"))) ||
        (typeof sm.name === "string" &&
          sm.name.toLowerCase().includes("pickup")),
    );
  }, [shippingMethodsQuery.data]);

  // Check if shipping method is not pickup
  const isShippingOtherThanPickup = useMemo(() => {
    if (!watchedShippingMethodId || !defaultShippingMethod) return false;

    return watchedShippingMethodId !== defaultShippingMethod.value;
  }, [watchedShippingMethodId, defaultShippingMethod]);

  const onSubmitForm: SubmitHandler<SalesOrderB2CFormValues> = async (
    values,
  ) => {
    // Validate delivery address if shipping is not pickup
    if (isShippingOtherThanPickup && !values.deliveryAddress?.trim()) {
      setValue("deliveryAddress", "", { shouldValidate: true });

      return;
    }

    await onSubmit(values);
  };

  // Format server time for display
  const formattedCreatedAt = useMemo(() => {
    const now = new Date();

    return now.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, []);

  const taxRateOptions = useMemo<SelectItemOption[]>(
    () =>
      (taxRatesQuery.data ?? []).map((tr) => {
        // Extract rate from name if available, otherwise use value
        const rate = tr.rate || tr.name?.rate || "";
        const label = rate ? `${tr.label} (${rate}%)` : tr.label;

        return {
          value: tr.value,
          label,
        };
      }),
    [taxRatesQuery.data],
  );

  const uomOptions = useMemo<SelectItemOption[]>(
    () =>
      (uomQuery.data ?? [])
        .filter((uom) => uom.isActive)
        .map((uom) => {
          const name = (uom.name as any)?.vi || (uom.name as any)?.en || "";
          const label = uom.symbol ? `${name} (${uom.symbol})` : name;

          return {
            value: uom.id,
            label,
          };
        }),
    [uomQuery.data],
  );

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmitForm)}>
      {submitError ? (
        <div
          aria-live="polite"
          className="rounded-xl border-2 border-danger-300 bg-danger-50 px-4 py-3 text-sm font-semibold text-danger-700 shadow-sm"
        >
          {submitError}
        </div>
      ) : null}

      {/* Section: Thông tin chung */}
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
          <GeneralInfoSection
            control={control}
            createdAt={formattedCreatedAt}
            currency={watchedCurrency}
          />
        </IBaseCardBody>
      </IBaseCard>

      {/* Section: Order Lines */}
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
          <OrderLinesSection
            append={append}
            control={control}
            defaultLine={validation.defaultLine}
            errors={errors}
            fields={fields}
            remove={remove}
            setValue={setValue}
            taxRateOptions={taxRateOptions}
            taxRatesQuery={taxRatesQuery}
            uomOptions={uomOptions}
            watchedCurrency={watchedCurrency}
            watchedLines={watchedLines}
            watchedPriceListId={watchedPriceListId}
          />
        </IBaseCardBody>
      </IBaseCard>

      {/* Section: Thông tin giao hàng */}
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
          <DeliveryInfoSection
            control={control}
            errors={errors}
            isShippingOtherThanPickup={isShippingOtherThanPickup}
          />
        </IBaseCardBody>
      </IBaseCard>

      {/* Order Totals */}
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
          <OrderTotalsSection
            calculatedTotals={calculatedTotals}
            control={control}
            errors={errors}
            isShippingOtherThanPickup={isShippingOtherThanPickup}
            watchedCurrency={watchedCurrency}
          />
        </IBaseCardBody>
      </IBaseCard>

      {/* Section: Thông tin khách hàng */}
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
          <CustomerInfoSection
            control={control}
            errors={errors}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            setValue={setValue}
          />
        </IBaseCardBody>
      </IBaseCard>

      {/* Notes */}
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
          <Controller
            control={control}
            name="notes"
            render={({ field, fieldState }) => (
              <IBaseTextarea
                {...field}
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label={tLabels("notes")}
                minRows={2}
                size="sm"
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
              {tLabels("createOrder")}
            </IBaseButton>
            {onCancel && (
              <IBaseButton size="md" variant="light" onPress={onCancel}>
                {tLabels("cancel")}
              </IBaseButton>
            )}
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </form>
  );
}
