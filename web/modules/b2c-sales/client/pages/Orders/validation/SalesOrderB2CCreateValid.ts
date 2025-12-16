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

// Quantity validation: 0-5000
export const quantitySchema = pipe(
  string(),
  trim(),
  minLength(1, "Quantity is required"),
  custom((value) => {
    const num = Number(value);

    return !Number.isNaN(num) && num >= 0 && num <= 5000;
  }, "Quantity must be between 0 and 5000"),
);

// Price validation: 0-100,000,000
export const priceSchema = pipe(
  string(),
  trim(),
  custom((value) => {
    if (value === "") return true;
    const num = Number(value);

    return !Number.isNaN(num) && num >= 0 && num <= 100000000;
  }, "Price must be between 0 and 100,000,000"),
);

// Discount validation: >= 0
export const discountSchema = pipe(
  string(),
  trim(),
  custom(
    (value) =>
      value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0),
    "Discount must be a number greater than or equal to 0",
  ),
);

// Tax rate validation: 0-100
export const taxRateSchema = pipe(
  string(),
  trim(),
  custom(
    (value) =>
      value === "" ||
      (!Number.isNaN(Number(value)) &&
        Number(value) >= 0 &&
        Number(value) <= 100),
    "Tax rate must be a number between 0 and 100",
  ),
);

// Order line schema
export const orderLineSchema = object({
  productId: pipe(string(), trim(), minLength(1, "Product is required")),
  unitId: optional(pipe(string(), trim())),
  quantity: quantitySchema,
  unitPrice: priceSchema,
  description: optional(pipe(string(), trim())),
  lineDiscount: optional(discountSchema),
  taxRate: optional(taxRateSchema),
});

// Main form schema
export const salesOrderB2CFormSchema = object({
  // Pricing & Currency
  priceListId: optional(pipe(string(), trim())),
  currency: pipe(string(), trim(), minLength(1, "Currency is required")),

  // Customer
  customerName: pipe(
    string(),
    trim(),
    minLength(1, "Customer name is required"),
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
    minLength(1, "At least one order line is required"),
  ),
});

// Form values type
export type SalesOrderB2CFormValues = InferOutput<
  typeof salesOrderB2CFormSchema
>;

// Default line for new order lines
export const defaultLine: SalesOrderB2CFormValues["lines"][number] = {
  productId: "",
  unitId: undefined,
  quantity: "1",
  unitPrice: "1",
  description: "",
  lineDiscount: "0",
  taxRate: "0",
};
