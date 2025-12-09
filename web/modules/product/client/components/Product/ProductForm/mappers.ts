import {
  ProductFormValues,
  ProductMasterFeatures,
  ProductMasterType,
} from "../../../interface/Product";
import type {
  LocaleFieldValue,
  UomConversions,
  VariantFieldValue,
} from "./types";

export type ProductFormFieldValues = {
  master: {
    code: string;
    name: LocaleFieldValue;
    description: string;
    type: ProductMasterType;
    features: Record<ProductMasterFeatures, boolean>;
    isActive: boolean;
    brand: string;
    categoryId?: string;
  };
  variants: VariantFieldValue[];
};

const defaultLocaleValue = (): LocaleFieldValue => ({ en: "", vi: "" });

const createDefaultVariant = (): VariantFieldValue => ({
  name: defaultLocaleValue(),
  description: "",
  sku: "",
  barcode: "",
  manufacturerName: "",
  manufacturerCode: "",
  baseUom: undefined,
  saleUom: undefined,
  purchaseUom: undefined,
  manufacturingUom: undefined,
  uomConversions: [],
  isActive: true,
  packings: [],
  attributes: [],
});

// Helper function to create default values with feature options
export const createDefaultValues = (
  featureOptions: { value: string; label: string }[]
): ProductFormFieldValues => {
  const {
    getDefaultFeaturesForType,
  } = require("../../../utils/product-features-validator");
  const defaultFeatures = getDefaultFeaturesForType(ProductMasterType.GOODS);

  return {
    master: {
      code: "",
      name: defaultLocaleValue(),
      description: "",
      type: ProductMasterType.GOODS,
      features: featureOptions.reduce(
        (acc, feature) => ({
          ...acc,
          [feature.value as ProductMasterFeatures]:
            defaultFeatures[feature.value as ProductMasterFeatures] ?? false,
        }),
        {} as Record<ProductMasterFeatures, boolean>
      ),
      isActive: true,
      brand: "",
      categoryId: undefined,
    },
    variants: [createDefaultVariant()],
  };
};

export { createDefaultVariant };

/**
 * Map ProductFormValues (API format) to ProductFormFieldValues (Form format)
 * Used when loading initial values into the form
 */
export const mapToFieldValues = (
  initialValues: ProductFormValues | undefined,
  featureOptions: { value: string; label: string }[]
): ProductFormFieldValues => {
  const defaults = createDefaultValues(featureOptions);

  if (!initialValues) {
    return defaults;
  }

  const featureState = featureOptions.reduce(
    (acc, feature) => ({
      ...acc,
      [feature.value as ProductMasterFeatures]:
        initialValues.master.features?.[
          feature.value as ProductMasterFeatures
        ] ?? defaults.master.features[feature.value as ProductMasterFeatures],
    }),
    {} as Record<ProductMasterFeatures, boolean>
  );

  // Map all variants from initialValues to variants array
  const mappedVariants: VariantFieldValue[] = initialValues.variants?.length
    ? initialValues.variants.map((variant) => ({
        name: {
          en: variant.name?.en ?? "",
          vi: variant.name?.vi ?? "",
        },
        description: variant.description || "",
        sku: variant.sku ?? "",
        barcode: variant.barcode ?? "",
        manufacturerName:
          typeof variant.manufacturerName === "string"
            ? variant.manufacturerName
            : "",
        manufacturerCode: variant.manufacturerCode ?? "",
        baseUom: variant.baseUomId
          ? { id: variant.baseUomId, name: "" }
          : undefined,
        saleUom: variant.saleUomId
          ? { id: variant.saleUomId, name: "" }
          : undefined,
        purchaseUom: variant.purchaseUomId
          ? { id: variant.purchaseUomId, name: "" }
          : undefined,
        manufacturingUom: variant.manufacturingUomId
          ? { id: variant.manufacturingUomId, name: "" }
          : undefined,
        uomConversions: (variant.uomConversions ?? []) as UomConversions[],
        isActive: variant.isActive ?? true,
        packings:
          variant.packings?.map((packing) => ({
            id: packing.id,
            name: {
              en: packing.name?.en ?? "",
              vi: packing.name?.vi ?? "",
            },
            description: packing.description || "",
            isActive: packing.isActive ?? true,
          })) ?? [],
        attributes:
          variant.attributes?.map((attribute) => ({
            id: attribute.id,
            code: attribute.code ?? "",
            name: {
              en: attribute.name?.en ?? "",
              vi: attribute.name?.vi ?? "",
            },
            value: attribute.value ?? "",
          })) ?? [],
      }))
    : [createDefaultVariant()];

  return {
    master: {
      code: initialValues.master.code ?? "",
      name: {
        en: initialValues.master.name?.en ?? "",
        vi: initialValues.master.name?.vi ?? "",
      },
      description: initialValues.master.description || "",
      type: initialValues.master.type || ProductMasterType.GOODS,
      features: featureState,
      isActive: initialValues.master.isActive ?? true,
      brand:
        typeof initialValues.master.brand === "string"
          ? initialValues.master.brand
          : "",
      categoryId: initialValues.master.categoryId ?? undefined,
    },
    variants: mappedVariants,
  };
};

/**
 * Map ProductFormFieldValues (Form format) to ProductFormValues (API format)
 * Used when submitting the form
 */
export const mapToProductFormValues = (
  values: ProductFormFieldValues
): ProductFormValues => {
  // Map all variants to array
  const mappedVariants = values.variants.map((variant) => ({
    name: {
      en: variant.name.en.trim() ? variant.name.en : undefined,
      vi: variant.name.vi.trim() ? variant.name.vi : undefined,
    },
    description: variant.description.trim() || "",
    sku: variant.sku,
    barcode: variant.barcode,
    manufacturerName: variant.manufacturerName.trim() || "",
    manufacturerCode: variant.manufacturerCode,
    baseUomId: variant.baseUom?.id,
    saleUomId: variant.saleUom?.id,
    purchaseUomId: variant.purchaseUom?.id,
    manufacturingUomId: variant.manufacturingUom?.id,
    uomConversions: variant.uomConversions
      .filter((uom) => uom.uomId !== null && uom.conversionRatio !== null)
      .map((uom) => ({
        uuid: uom.uuid,
        uomId: uom.uomId,
        uomName: uom.uomName,
        label: uom.label,
        type: uom.type,
        isActive: uom.isActive,
        conversionRatio: uom.conversionRatio,
      })),
    isActive: variant.isActive,
    packings: variant.packings.map((packing) => ({
      id: packing.id,
      name: {
        en: packing.name.en.trim() ? packing.name.en : undefined,
        vi: packing.name.vi.trim() ? packing.name.vi : undefined,
      },
      description: packing.description.trim() || "",
      isActive: packing.isActive,
    })),
    attributes: variant.attributes.map((attribute) => ({
      id: attribute.id,
      code: attribute.code,
      name: {
        en: attribute.name.en.trim() ? attribute.name.en : undefined,
        vi: attribute.name.vi.trim() ? attribute.name.vi : undefined,
      },
      value: attribute.value,
    })),
  }));

  return {
    master: {
      code: values.master.code,
      name: {
        en: values.master.name.en.trim() ? values.master.name.en : undefined,
        vi: values.master.name.vi.trim() ? values.master.name.vi : undefined,
      },
      description: values.master.description.trim() || "",
      type: values.master.type,
      features: values.master.features,
      isActive: values.master.isActive,
      brand: values.master.brand.trim() || "",
      categoryId: values.master.categoryId,
    },
    variants: mappedVariants,
  };
};
