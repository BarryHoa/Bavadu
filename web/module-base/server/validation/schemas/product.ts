import * as v from "valibot";

import { uuidSchema, trimmedStringSchema } from "./common";

/**
 * Locale data type validator
 * Accepts string or object with en/vi keys
 */
export const localeInputSchema = v.union([
  v.string(),
  v.object({
    en: v.optional(v.string()),
    vi: v.optional(v.string()),
  }),
  v.null_(),
  v.undefined(),
]);

/**
 * Product type enum validator
 */
export const productTypeSchema = v.picklist([
  "goods",
  "raw_material",
  "finished_good",
  "consumable",
  "tool",
  "asset",
  "service",
]);

/**
 * Product master features schema
 */
export const productFeaturesSchema = v.object({
  sale: v.optional(v.boolean()),
  purchase: v.optional(v.boolean()),
  manufacture: v.optional(v.boolean()),
  subcontract: v.optional(v.boolean()),
  stockable: v.optional(v.boolean()),
  maintenance: v.optional(v.boolean()),
  asset: v.optional(v.boolean()),
  accounting: v.optional(v.boolean()),
});

/**
 * Product master input schema
 */
export const productMasterInputSchema = v.object({
  id: v.optional(uuidSchema),
  code: trimmedStringSchema(1, 100, "Product code"),
  name: localeInputSchema,
  description: v.optional(v.union([v.string(), v.null_()])),
  type: productTypeSchema,
  features: v.optional(v.union([productFeaturesSchema, v.null_()])),
  isActive: v.optional(v.boolean()),
  brand: v.optional(v.union([trimmedStringSchema(1, 100, "Brand"), v.null_()])),
  categoryId: v.optional(v.union([uuidSchema, v.null_()])),
});

/**
 * Manufacturer schema
 */
export const manufacturerSchema = v.object({
  name: v.optional(
    v.union([trimmedStringSchema(1, 255, "Manufacturer name"), v.null_()]),
  ),
  code: v.optional(
    v.union([trimmedStringSchema(1, 100, "Manufacturer code"), v.null_()]),
  ),
});

/**
 * Product image schema
 */
export const productImageSchema = v.object({
  url: v.pipe(v.string(), v.url("Invalid image URL")),
  alt: v.optional(v.union([v.string(), v.null_()])),
});

/**
 * Product variant input schema
 */
export const productVariantInputSchema = v.object({
  id: v.optional(uuidSchema),
  name: localeInputSchema,
  description: v.optional(v.union([v.string(), v.null_()])),
  sku: v.optional(v.union([trimmedStringSchema(1, 100, "SKU"), v.null_()])),
  barcode: v.optional(
    v.union([trimmedStringSchema(1, 100, "Barcode"), v.null_()]),
  ),
  manufacturer: v.optional(v.union([manufacturerSchema, v.null_()])),
  baseUomId: v.optional(v.union([uuidSchema, v.null_()])),
  isActive: v.optional(v.boolean()),
  images: v.optional(v.array(productImageSchema)),
});

/**
 * Product packing input schema
 */
export const productPackingInputSchema = v.object({
  id: v.optional(uuidSchema),
  name: localeInputSchema,
  description: v.optional(v.union([v.string(), v.null_()])),
  isActive: v.optional(v.boolean()),
});

/**
 * Product attribute input schema
 */
export const productAttributeInputSchema = v.object({
  id: v.optional(uuidSchema),
  code: trimmedStringSchema(1, 100, "Attribute code"),
  name: localeInputSchema,
  value: v.pipe(
    v.string(),
    v.maxLength(500, "Attribute value must be at most 500 characters"),
  ),
});

/**
 * Product create input schema
 */
export const productCreateInputSchema = v.object({
  master: productMasterInputSchema,
  variant: productVariantInputSchema,
  packings: v.optional(v.array(productPackingInputSchema)),
  attributes: v.optional(v.array(productAttributeInputSchema)),
});

/**
 * Product update input schema
 */
export const productUpdateInputSchema = v.object({
  id: uuidSchema,
  master: productMasterInputSchema,
  variant: productVariantInputSchema,
  packings: v.optional(v.array(productPackingInputSchema)),
  attributes: v.optional(v.array(productAttributeInputSchema)),
});

/**
 * Product ID parameter schema (for route params)
 */
export const productIdParamSchema = v.object({
  id: uuidSchema,
});
