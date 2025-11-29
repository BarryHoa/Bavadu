"use client";

import { SelectItemOption } from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { Button } from "@heroui/button";
import { Card, CardBody, Divider, Textarea } from "@heroui/react";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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

import {
  paymentMethodService,
  shippingMethodService,
  shippingTermService,
  taxRateService,
} from "@base/client/services";
import currencyService from "@base/client/services/CurrencyService";
import StockService from "@mdl/stock/client/services/StockService";
import UnitOfMeasureService from "@mdl/product/client/services/UnitOfMeasureService";
import { type CustomerIndividualDto } from "../../services/CustomerService";
import { salesOrderB2CService } from "../../services/SalesOrderB2CService";
import CustomerInfoSection from "./components/CustomerInfoSection";
import DeliveryInfoSection from "./components/DeliveryInfoSection";
import GeneralInfoSection from "./components/GeneralInfoSection";
import OrderLinesSection from "./components/OrderLinesSection";
import OrderTotalsSection from "./components/OrderTotalsSection";

const quantitySchema = pipe(
  string(),
  trim(),
  minLength(1, "Quantity is required"),
  custom(
    (value) => {
      const num = Number(value);
      return !Number.isNaN(num) && num >= 0 && num <= 5000;
    },
    "Quantity must be between 0 and 5000"
  )
);

const priceSchema = pipe(
  string(),
  trim(),
  custom(
    (value) => {
      if (value === "") return true;
      const num = Number(value);
      return !Number.isNaN(num) && num >= 0 && num <= 100000000;
    },
    "Price must be between 0 and 100,000,000"
  )
);

const discountSchema = pipe(
  string(),
  trim(),
  custom(
    (value) =>
      value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0),
    "Discount must be a number greater than or equal to 0"
  )
);

const taxRateSchema = pipe(
  string(),
  trim(),
  custom(
    (value) =>
      value === "" ||
      (!Number.isNaN(Number(value)) &&
        Number(value) >= 0 &&
        Number(value) <= 100),
    "Tax rate must be a number between 0 and 100"
  )
);

const orderLineSchema = object({
  productId: pipe(string(), trim(), minLength(1, "Product is required")),
  unitId: optional(pipe(string(), trim())),
  quantity: quantitySchema,
  unitPrice: priceSchema,
  description: optional(pipe(string(), trim())),
  lineDiscount: optional(discountSchema),
  taxRate: optional(taxRateSchema),
});

const salesOrderB2CFormSchema = object({
  // Pricing & Currency
  pricingId: optional(pipe(string(), trim())),
  currency: pipe(string(), trim(), minLength(1, "Currency is required")),

  // Customer
  customerName: pipe(
    string(),
    trim(),
    minLength(1, "Customer name is required")
  ),
  requireInvoice: optional(
    custom((value) => typeof value === "boolean" || value === undefined)
  ),

  // Delivery
  paymentMethodId: optional(pipe(string(), trim())),
  shippingMethodId: optional(pipe(string(), trim())),
  shippingTermsId: optional(pipe(string(), trim())),
  deliveryAddress: optional(pipe(string(), trim())),
  shippingFee: optional(discountSchema),
  expectedDate: optional(pipe(string(), trim())),

  // Order
  warehouseId: optional(pipe(string(), trim())),
  notes: optional(pipe(string(), trim())),
  totalDiscount: optional(discountSchema),
  totalTax: optional(discountSchema),
  lines: pipe(
    array(orderLineSchema),
    minLength(1, "At least one order line is required")
  ),
});

type SalesOrderB2CFormValues = {
  pricingId?: string;
  currency: string;
  customerName: string;
  requireInvoice?: boolean;
  paymentMethodId?: string;
  shippingMethodId?: string;
  shippingTermsId?: string;
  deliveryAddress?: string;
  shippingFee?: string;
  expectedDate?: string;
  warehouseId?: string;
  notes?: string;
  totalDiscount?: string;
  totalTax?: string;
  lines: Array<{
    productId: string;
    unitId?: string;
    quantity: string;
    unitPrice: string;
    description?: string;
    lineDiscount?: string;
    taxRate?: string;
  }>;
};

const defaultLine: SalesOrderB2CFormValues["lines"][number] = {
  productId: "",
  unitId: undefined,
  quantity: "1",
  unitPrice: "1",
  description: "",
  lineDiscount: "0",
  taxRate: "0",
};

const DEFAULT_CUSTOMER_NAME = "Khách lẻ";
const DEFAULT_CURRENCY = "VND";

export default function SalesOrderB2CCreatePage(): React.ReactNode {
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerIndividualDto | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SalesOrderB2CFormValues>({
    resolver: valibotResolver(salesOrderB2CFormSchema) as any,
    defaultValues: {
      pricingId: undefined,
      currency: DEFAULT_CURRENCY,
      customerName: DEFAULT_CUSTOMER_NAME,
      requireInvoice: false,
      paymentMethodId: "",
      shippingMethodId: "",
      shippingTermsId: "",
      deliveryAddress: "",
      shippingFee: "0",
      expectedDate: "",
      warehouseId: "",
      notes: "",
      totalDiscount: "0",
      totalTax: "0",
      lines: [defaultLine],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const watchedLines = watch("lines");
  const watchedPricingId = watch("pricingId");
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
          wh.typeCode?.toUpperCase().includes("INTERNAL")
      );
    },
  });

  const currenciesQuery = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const response = await currencyService.getList();
      return response.data ?? [];
    },
  });

  const paymentMethodsQuery = useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const response = await paymentMethodService.getList();
      return response.data ?? [];
    },
  });

  const shippingMethodsQuery = useQuery({
    queryKey: ["shipping-methods"],
    queryFn: async () => {
      const response = await shippingMethodService.getList();
      return response.data ?? [];
    },
  });

  const shippingTermsQuery = useQuery({
    queryKey: ["shipping-terms"],
    queryFn: async () => {
      const response = await shippingTermService.getList();
      return response.data ?? [];
    },
  });

  const taxRatesQuery = useQuery({
    queryKey: ["tax-rates"],
    queryFn: async () => {
      const response = await taxRateService.getList();
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
        pm.name.vi?.toLowerCase().includes("tiền mặt") ||
        pm.name.en?.toLowerCase().includes("cash")
    );
  }, [paymentMethodsQuery.data]);

  // Find default shipping method (Pickup/Tự nhận)
  const defaultShippingMethod = useMemo(() => {
    if (!shippingMethodsQuery.data) return undefined;
    return shippingMethodsQuery.data.find(
      (sm) =>
        sm.code?.toLowerCase().includes("pickup") ||
        sm.name.vi?.toLowerCase().includes("tự nhận") ||
        sm.name.en?.toLowerCase().includes("pickup")
    );
  }, [shippingMethodsQuery.data]);

  // Set default payment and shipping methods
  useMemo(() => {
    if (defaultPaymentMethod && !watch("paymentMethodId")) {
      setValue("paymentMethodId", defaultPaymentMethod.id);
    }
    if (defaultShippingMethod && !watch("shippingMethodId")) {
      setValue("shippingMethodId", defaultShippingMethod.id);
    }
  }, [defaultPaymentMethod, defaultShippingMethod, setValue, watch]);

  // Check if shipping method is not pickup
  const isShippingOtherThanPickup = useMemo(() => {
    if (!watchedShippingMethodId || !defaultShippingMethod) return false;
    return watchedShippingMethodId !== defaultShippingMethod.id;
  }, [watchedShippingMethodId, defaultShippingMethod]);

  const { handleSubmit: submitOrder, error: submitError } = useCreateUpdate<
    Parameters<typeof salesOrderB2CService.create>[0],
    { order: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await salesOrderB2CService.create(payload);
      if (!response.data) {
        throw new Error(
          response.message ?? "Failed to create B2C sales order."
        );
      }
      return response.data;
    },
    invalidateQueries: [["b2c-sales-orders"]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/b2c-sales/view/${data.order.id}`);
    },
  });

  const onSubmit: SubmitHandler<SalesOrderB2CFormValues> = async (values) => {
    // Validate delivery address if shipping is not pickup
    if (isShippingOtherThanPickup && !values.deliveryAddress?.trim()) {
      setValue("deliveryAddress", "", { shouldValidate: true });
      return;
    }

    const payload = {
      customerName: values.customerName.trim(),
      deliveryAddress: isShippingOtherThanPickup
        ? values.deliveryAddress?.trim() || undefined
        : undefined,
      paymentMethodId: values.paymentMethodId?.trim() || undefined,
      shippingMethodId: values.shippingMethodId?.trim() || undefined,
      shippingTermsId: values.shippingTermsId?.trim() || undefined,
      requireInvoice: values.requireInvoice || false,
      warehouseId: values.warehouseId?.trim() || undefined,
      expectedDate: values.expectedDate?.trim() || undefined,
      currency: values.currency.trim(),
      notes: values.notes?.trim() || undefined,
      totalDiscount: values.totalDiscount
        ? Number(values.totalDiscount)
        : undefined,
      totalTax: values.totalTax ? Number(values.totalTax) : undefined,
      shippingFee:
        isShippingOtherThanPickup && values.shippingFee
          ? Number(values.shippingFee)
          : undefined,
      lines: values.lines
        .map((line) => ({
          productId: line.productId.trim(),
          unitId: line.unitId?.trim() || undefined,
          quantity: Number(line.quantity),
          unitPrice: line.unitPrice ? Number(line.unitPrice) : undefined,
          description: line.description?.trim() || undefined,
          lineDiscount: line.lineDiscount
            ? Number(line.lineDiscount)
            : undefined,
          taxRate: line.taxRate ? Number(line.taxRate) : undefined,
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
    [warehousesQuery.data]
  );

  const currencyOptions = useMemo<SelectItemOption[]>(
    () =>
      (currenciesQuery.data ?? [])
        .filter((c) => c.isActive)
        .map((currency) => ({
          value: currency.code,
          label: `${currency.code} - ${currency.name.vi || currency.name.en || currency.code}`,
        })),
    [currenciesQuery.data]
  );

  const pricingOptions = useMemo<SelectItemOption[]>(
    () => [], // TODO: Load pricing options when available
    []
  );

  const paymentMethodOptions = useMemo<SelectItemOption[]>(
    () =>
      (paymentMethodsQuery.data ?? [])
        .filter((pm) => pm.isActive)
        .map((pm) => ({
          value: pm.id,
          label: pm.name.en || pm.name.vi || pm.code,
        })),
    [paymentMethodsQuery.data]
  );

  const shippingMethodOptions = useMemo<SelectItemOption[]>(
    () =>
      (shippingMethodsQuery.data ?? [])
        .filter((sm) => sm.isActive)
        .map((sm) => ({
          value: sm.id,
          label: sm.name.en || sm.name.vi || sm.code,
        })),
    [shippingMethodsQuery.data]
  );

  const shippingTermOptions = useMemo<SelectItemOption[]>(
    () =>
      (shippingTermsQuery.data ?? [])
        .filter((st) => st.isActive)
        .map((st) => ({
          value: st.id,
          label: st.name.en || st.name.vi || st.code,
        })),
    [shippingTermsQuery.data]
  );

  const taxRateOptions = useMemo<SelectItemOption[]>(
    () =>
      (taxRatesQuery.data ?? [])
        .filter((tr) => tr.isActive)
        .map((tr) => ({
          value: tr.rate,
          label: `${tr.name.en || tr.name.vi || tr.code} (${tr.rate}%)`,
        })),
    [taxRatesQuery.data]
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
    [uomQuery.data]
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          as={LinkAs as any}
          size="sm"
          variant="light"
          href="/workspace/modules/b2c-sales"
        >
          Back to list
        </Button>
      </div>

      <Card>
        <CardBody className="p-4">
          {submitError ? (
            <div className="mb-3 rounded-large border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-600">
              {submitError}
            </div>
          ) : null}

          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            {/* Section: Thông tin chung */}
            <GeneralInfoSection
              control={control}
              pricingOptions={pricingOptions}
              currencyOptions={currencyOptions}
              warehouseOptions={warehouseOptions}
              watchedPricingId={watchedPricingId}
              errors={errors}
            />

            <Divider />

            {/* Section: Order Lines */}
            <OrderLinesSection
              control={control}
              fields={fields}
              append={append}
              remove={remove}
              watchedLines={watchedLines}
              watchedCurrency={watchedCurrency}
              taxRateOptions={taxRateOptions}
              taxRatesQuery={taxRatesQuery}
              uomOptions={uomOptions}
              errors={errors}
              defaultLine={defaultLine}
            />

            <Divider />

            {/* Section: Thông tin giao hàng */}
            <DeliveryInfoSection
              control={control}
              paymentMethodOptions={paymentMethodOptions}
              shippingMethodOptions={shippingMethodOptions}
              shippingTermOptions={shippingTermOptions}
              isShippingOtherThanPickup={isShippingOtherThanPickup}
              errors={errors}
            />

            <Divider />

            {/* Order Totals */}
            <OrderTotalsSection
              control={control}
              calculatedTotals={calculatedTotals}
              watchedCurrency={watchedCurrency}
              isShippingOtherThanPickup={isShippingOtherThanPickup}
              errors={errors}
            />

            <Divider />

            {/* Section: Thông tin khách hàng */}
            <CustomerInfoSection
              control={control}
              setValue={setValue}
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              errors={errors}
            />

            <Divider />

            {/* Notes */}
            <Controller
              name="notes"
              control={control}
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  label="Notes"
                  size="sm"
                  minRows={2}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                size="sm"
                variant="light"
                onPress={() => router.push("/workspace/modules/b2c-sales")}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Create Order
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
