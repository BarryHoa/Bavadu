import { LocaleDataType } from "@base/server/interfaces/Locale";

import {
  LocaleFormValue,
  ProductAttributeRow,
  ProductDetail,
  ProductFormAttribute,
  ProductFormPacking,
  ProductFormPayload,
  ProductFormValues,
  ProductMasterFeatures,
  ProductMasterType,
  ProductPackingRow,
} from "../interface/Product";

const ensureLocaleValue = (value?: LocaleFormValue | null): LocaleFormValue => ({
  en: value?.en ?? "",
  vi: value?.vi ?? "",
});

const toLocaleFormValue = (value: unknown): LocaleFormValue => {
  if (!value) {
    return { en: "", vi: "" };
  }

  if (typeof value === "string") {
    return { en: value, vi: "" };
  }

  const record = value as Record<string, string>;
  return {
    en: record?.en ?? "",
    vi: record?.vi ?? "",
  };
};

const toLocaleRecord = (
  value: LocaleFormValue,
  fallback?: string
): LocaleDataType<string> | null => {
  const record: Record<string, string> = {};

  if (value.en && value.en.trim()) {
    record.en = value.en.trim();
  }

  if (value.vi && value.vi.trim()) {
    record.vi = value.vi.trim();
  }

  if (Object.keys(record).length === 0) {
    if (fallback) {
      return { en: fallback };
    }
    return null;
  }

  return record as LocaleDataType<string>;
};

const sanitizePackings = (
  packings: ProductFormPacking[]
): ProductFormPayload["packings"] => {
  return packings
    .map((packing) => ({
      ...packing,
      name: ensureLocaleValue(packing.name),
      description: packing.description || "",
    }))
    .filter((packing) =>
      Boolean(packing.name.en?.trim() || packing.name.vi?.trim())
    )
    .map((packing) => ({
      id: packing.id,
      name: toLocaleRecord(packing.name) ?? { en: packing.id ?? "" },
      description: packing.description?.trim() || null,
      isActive: packing.isActive,
    }));
};

const sanitizeAttributes = (
  attributes: ProductFormAttribute[]
): ProductFormPayload["attributes"] => {
  return attributes
    .filter((attribute) => attribute.code.trim())
    .map((attribute) => ({
      id: attribute.id,
      code: attribute.code.trim(),
      name:
        toLocaleRecord(ensureLocaleValue(attribute.name), attribute.code) ?? {
          en: attribute.code.trim(),
        },
      value: attribute.value,
    }));
};

export const mapDetailToFormValues = (
  detail: ProductDetail
): ProductFormValues => {
  const baseFeatures = Object.values(ProductMasterFeatures).reduce(
    (acc, key) => ({ ...acc, [key]: false }),
    {} as Record<ProductMasterFeatures, boolean>
  );

  const masterFeatures = detail.master.features ?? {};

  const features = { ...baseFeatures };
  Object.entries(masterFeatures).forEach(([key, value]) => {
    if (key in features) {
      features[key as ProductMasterFeatures] = Boolean(value);
    }
  });

  const mapPackings = (packings: ProductPackingRow[]): ProductFormPacking[] =>
    packings.map((packing) => ({
      id: packing.id,
      name: toLocaleFormValue(packing.name),
      description: typeof packing.description === "string" 
        ? packing.description 
        : (packing.description?.vi || packing.description?.en || ""),
      isActive: packing.isActive ?? true,
    }));

  const mapAttributes = (
    attributes: ProductAttributeRow[]
  ): ProductFormAttribute[] =>
    attributes.map((attribute) => ({
      id: attribute.id,
      code: attribute.code,
      name: toLocaleFormValue(attribute.name),
      value: attribute.value,
    }));

  return {
    master: {
      code: detail.master.code,
      name: toLocaleFormValue(detail.master.name),
      description: detail.master.description || "",
      type: (detail.master.type as ProductMasterType) ?? ProductMasterType.GOODS,
      features,
      isActive: detail.master.isActive ?? true,
      brand:
        typeof detail.master.brand === "string" ? detail.master.brand : "",
      categoryId: detail.master.category?.id,
      images: (detail.master as any).images ?? [],
    },
    variants: [{
      name: toLocaleFormValue(detail.variant.name),
      description: detail.variant.description || "",
      sku: detail.variant.sku ?? "",
      barcode: detail.variant.barcode ?? "",
      manufacturerName:
        typeof detail.variant.manufacturer?.name === "string"
          ? detail.variant.manufacturer.name
          : "",
      manufacturerCode: detail.variant.manufacturer?.code ?? "",
      baseUomId: detail.variant.baseUom?.id,
      isActive: detail.variant.isActive ?? true,
      images: detail.variant.images ?? [],
      packings: mapPackings(detail.packings),
      attributes: mapAttributes(detail.attributes),
    }],
  };
};

export const mapFormValuesToPayload = (
  values: ProductFormValues
): ProductFormPayload => {
  const trimmedCode = values.master.code.trim();
  const masterNameRecord =
    toLocaleRecord(ensureLocaleValue(values.master.name), trimmedCode) ?? {
      en: trimmedCode,
    };
  const masterDescription = values.master.description.trim() || null;
  const masterBrand = values.master.brand.trim() || null;

  const firstVariant = values.variants[0];
  if (!firstVariant) {
    throw new Error("At least one variant is required");
  }

  const variantNameRecord =
    toLocaleRecord(ensureLocaleValue(firstVariant.name), trimmedCode) ?? {
      en: trimmedCode,
    };
  const variantDescription = firstVariant.description.trim() || null;
  const manufacturerName = firstVariant.manufacturerName.trim() || null;

  return {
    master: {
      code: trimmedCode,
      name: masterNameRecord,
      description: masterDescription,
      type:
        (values.master.type as ProductMasterType) ?? ProductMasterType.GOODS,
      features: values.master.features,
      isActive: values.master.isActive,
      brand: masterBrand,
      categoryId: values.master.categoryId ?? null,
    },
    variant: {
      name: variantNameRecord,
      description: variantDescription,
      sku: firstVariant.sku ? firstVariant.sku.trim() : null,
      barcode: firstVariant.barcode ? firstVariant.barcode.trim() : null,
      manufacturer:
        manufacturerName ||
        (firstVariant.manufacturerCode &&
          firstVariant.manufacturerCode.trim())
          ? {
              name: manufacturerName,
              code: firstVariant.manufacturerCode
                ? firstVariant.manufacturerCode.trim()
                : null,
            }
          : null,
      baseUomId: firstVariant.baseUomId || null,
      isActive: firstVariant.isActive,
      images: undefined,
    },
    packings: sanitizePackings(firstVariant.packings),
    attributes: sanitizeAttributes(firstVariant.attributes),
  };
};
