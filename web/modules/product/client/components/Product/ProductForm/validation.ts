import {
  any,
  array,
  boolean,
  fallback,
  maxLength,
  minLength,
  minValue,
  nullable,
  number,
  object,
  optional,
  picklist,
  pipe,
  record,
  string,
  trim,
} from "valibot";

import {
  ProductMasterFeatures,
  ProductMasterType,
} from "../../../interface/Product";

const localeSchema = object({
  en: fallback(pipe(string(), trim()), ""),
  vi: fallback(pipe(string(), trim()), ""),
});

// Note: Validation messages will be translated in the component using t()
export const createLocaleRequiredSchema = (t: (key: string) => string) =>
  object({
    en: pipe(
      fallback(pipe(string(), trim()), ""),
      minLength(1, t("errors.required")),
    ),
    vi: fallback(pipe(string(), trim()), ""),
  });

// Schema validation uses enum values directly
const productFeatureValues = Object.values(ProductMasterFeatures) as [
  ProductMasterFeatures,
  ...ProductMasterFeatures[],
];

export const featuresSchema = record(picklist(productFeatureValues), boolean());

const productMasterTypeValues = Object.values(ProductMasterType) as [
  ProductMasterType,
  ...ProductMasterType[],
];

// Note: These schemas will be created inside the component to access t()
export const createVariantSchema = (
  t: (key: string) => string,
  tProduct: (key: string) => string,
  tProductForm: (key: string) => string,
) =>
  object({
    name: createLocaleRequiredSchema(t),
    description: fallback(pipe(string(), trim()), ""),
    sku: pipe(string(), trim(), minLength(1, t("errors.skuRequired"))),
    barcode: pipe(string(), trim(), minLength(1, t("errors.barcodeRequired"))),
    manufacturerName: fallback(pipe(string(), trim()), ""),
    manufacturerCode: pipe(string(), trim()),
    baseUom: object({
      id: pipe(
        string(),
        trim(),
        minLength(1, tProductForm("errors.baseUnitOfMeasureRequired")),
      ),
    }),
    saleUom: optional(
      object({
        id: pipe(string(), trim()),
      }),
    ),
    purchaseUom: optional(
      object({
        id: pipe(string(), trim()),
      }),
    ),
    manufacturingUom: optional(
      object({
        id: pipe(string(), trim()),
      }),
    ),
    uomConversions: array(
      object({
        uuid: pipe(string(), trim()),
        uomId: nullable(pipe(string(), trim())),
        uomName: nullable(pipe(string(), trim())),
        label: pipe(string(), trim()),
        type: pipe(string(), trim()),
        isActive: boolean(),
        conversionRatio: nullable(
          pipe(
            number(),
            minValue(0.000001, tProductForm("errors.conversionRatioRequired")),
          ),
        ),
      }),
    ),

    isActive: boolean(),
    images: optional(array(any())),
    packings: array(
      object({
        id: optional(pipe(string(), trim())),
        name: localeSchema,
        description: localeSchema,
        isActive: boolean(),
      }),
    ),
    attributes: array(
      object({
        id: optional(pipe(string(), trim())),
        code: pipe(string(), trim()),
        name: localeSchema,
        value: pipe(string(), trim()),
      }),
    ),
  });

export const createProductFormSchema = (
  t: (key: string) => string,
  tProduct: (key: string) => string,
  tProductForm: (key: string) => string,
  formatMessage: (
    key: string,
    values: Record<string, string | number>,
  ) => string,
) =>
  object({
    master: object({
      code: pipe(
        string(),
        trim(),
        minLength(1, tProductForm("errors.productCodeRequired")),
      ),
      name: createLocaleRequiredSchema(t),
      description: fallback(pipe(string(), trim()), ""),
      type: picklist(productMasterTypeValues),
      features: featuresSchema,
      isActive: boolean(),
      brand: fallback(pipe(string(), trim()), ""),
      categoryId: optional(pipe(string(), trim())),
      images: pipe(
        array(any()),
        minLength(1, tProductForm("errors.masterImageRequired")),
      ),
    }),
    variants: pipe(
      array(createVariantSchema(t, tProduct, tProductForm)),
      minLength(1, tProductForm("errors.atLeastOneVariantRequired")),
      maxLength(20, formatMessage("errors.maxVariantsAllowed", { count: 20 })),
    ),
  });
