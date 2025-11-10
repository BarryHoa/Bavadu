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
      description: ensureLocaleValue(packing.description),
    }))
    .filter((packing) =>
      Boolean(packing.name.en?.trim() || packing.name.vi?.trim())
    )
    .map((packing) => ({
      id: packing.id,
      name: toLocaleRecord(packing.name) ?? { en: packing.id ?? "" },
      description: toLocaleRecord(packing.description),
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
      description: toLocaleFormValue(packing.description),
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
      description: toLocaleFormValue(detail.master.description),
      type: (detail.master.type as ProductMasterType) ?? ProductMasterType.GOODS,
      features,
      isActive: detail.master.isActive ?? true,
      brand: toLocaleFormValue(detail.master.brand),
      categoryId: detail.master.category?.id,
    },
    variant: {
      name: toLocaleFormValue(detail.variant.name),
      description: toLocaleFormValue(detail.variant.description),
      sku: detail.variant.sku ?? "",
      barcode: detail.variant.barcode ?? "",
      manufacturerName: toLocaleFormValue(detail.variant.manufacturer?.name),
      manufacturerCode: detail.variant.manufacturer?.code ?? "",
      baseUomId: detail.variant.baseUom?.id,
      isActive: detail.variant.isActive ?? true,
    },
    packings: mapPackings(detail.packings),
    attributes: mapAttributes(detail.attributes),
  };
};

export const mapFormValuesToPayload = (
  values: ProductFormValues
): ProductFormPayload => ({
  master: {
    code: values.master.code.trim(),
    name: toLocaleRecord(ensureLocaleValue(values.master.name), values.master.code),
    description: toLocaleRecord(
      ensureLocaleValue(values.master.description),
      values.master.code
    ),
    type:
      (values.master.type as ProductMasterType) ?? ProductMasterType.GOODS,
    features: values.master.features,
    isActive: values.master.isActive,
    brand: toLocaleRecord(ensureLocaleValue(values.master.brand)),
    categoryId: values.master.categoryId ?? null,
  },
  variant: {
    name: toLocaleRecord(
      ensureLocaleValue(values.variant.name),
      values.master.code
    ) ?? { en: values.master.code.trim() },
    description: toLocaleRecord(ensureLocaleValue(values.variant.description)),
    sku: values.variant.sku ? values.variant.sku.trim() : null,
    barcode: values.variant.barcode ? values.variant.barcode.trim() : null,
    manufacturer:
      values.variant.manufacturerName.en || values.variant.manufacturerName.vi || values.variant.manufacturerCode
        ? {
            name: toLocaleRecord(
              ensureLocaleValue(values.variant.manufacturerName)
            ),
            code: values.variant.manufacturerCode
              ? values.variant.manufacturerCode.trim()
              : null,
          }
        : null,
    baseUomId: values.variant.baseUomId || null,
    isActive: values.variant.isActive,
    images: undefined,
  },
  packings: sanitizePackings(values.packings),
  attributes: sanitizeAttributes(values.attributes),
});
