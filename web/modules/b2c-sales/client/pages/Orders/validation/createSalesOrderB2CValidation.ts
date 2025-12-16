import {
  array,
  boolean,
  custom,
  minLength,
  object,
  optional,
  pipe,
  string,
  trim,
  type InferOutput,
} from "valibot";

/**
 * Translation function type
 */
type TranslateFn = (key: string, values?: Record<string, any>) => string;

/**
 * Create validation schemas with translation support
 */
export function createSalesOrderB2CValidation(t: TranslateFn) {
  // Quantity validation: 0-5000
  const quantitySchema = pipe(
    string(),
    trim(),
    minLength(1, t("validation.quantity.required")),
    custom(
      (value) => {
        const num = Number(value);

        return !Number.isNaN(num) && num >= 0 && num <= 5000;
      },
      t("validation.quantity.range", { min: 0, max: 5000 }),
    ),
  );

  // Price validation: 0-100,000,000
  const priceSchema = pipe(
    string(),
    trim(),
    custom(
      (value) => {
        if (value === "") return true;
        const num = Number(value);

        return !Number.isNaN(num) && num >= 0 && num <= 100000000;
      },
      t("validation.price.range", { min: 0, max: 100000000 }),
    ),
  );

  // Discount validation: >= 0
  const discountSchema = pipe(
    string(),
    trim(),
    custom(
      (value) =>
        value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      t("validation.discount.min", { min: 0 }),
    ),
  );

  // Tax rate validation: 0-100
  const taxRateSchema = pipe(
    string(),
    trim(),
    custom(
      (value) =>
        value === "" ||
        (!Number.isNaN(Number(value)) &&
          Number(value) >= 0 &&
          Number(value) <= 100),
      t("validation.taxRate.range", { min: 0, max: 100 }),
    ),
  );

  // Order line schema
  const orderLineSchema = object({
    productId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.product.required")),
    ),
    unitId: optional(pipe(string(), trim())),
    quantity: quantitySchema,
    unitPrice: priceSchema,
    description: optional(pipe(string(), trim())),
    lineDiscount: optional(discountSchema),
    taxRate: optional(taxRateSchema),
  });

  // Main form schema
  const salesOrderB2CFormSchema = object({
    // Pricing & Currency
    priceListId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.priceListId.required")),
    ),
    currency: pipe(
      string(),
      trim(),
      minLength(1, t("validation.currency.required")),
    ),

    // Customer
    customerName: pipe(
      string(),
      trim(),
      minLength(1, t("validation.customerName.required")),
    ),
    requireInvoice: optional(boolean()),

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
      minLength(1, t("validation.lines.required")),
    ),
  });

  // Form values type
  type SalesOrderB2CFormValues = InferOutput<typeof salesOrderB2CFormSchema>;

  // Default line for new order lines
  const defaultLine: SalesOrderB2CFormValues["lines"][number] = {
    productId: "",
    unitId: undefined,
    quantity: "1",
    unitPrice: "1",
    description: "",
    lineDiscount: "0",
    taxRate: "0",
  };

  return {
    quantitySchema,
    priceSchema,
    discountSchema,
    taxRateSchema,
    orderLineSchema,
    salesOrderB2CFormSchema,
    defaultLine,
  };
}

export type SalesOrderB2CFormValues = InferOutput<
  ReturnType<typeof createSalesOrderB2CValidation>["salesOrderB2CFormSchema"]
>;
