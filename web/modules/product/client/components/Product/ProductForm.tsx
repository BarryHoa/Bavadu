"use client";

import { SelectItemOption } from "@base/client/components";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/react";
import { Tab, Tabs } from "@heroui/tabs";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Resolver, SubmitHandler } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import {
  array,
  boolean,
  fallback,
  maxLength,
  minLength,
  object,
  optional,
  picklist,
  pipe,
  record,
  string,
  trim,
} from "valibot";

import {
  LocaleFormValue,
  ProductFormValues,
  ProductMasterFeatures,
  ProductMasterType,
} from "../../interface/Product";
import type { ProductCategoryRow } from "../../interface/ProductCategory";
import ProductCategoryService from "../../services/ProductCategoryService";
import UnitOfMeasureService from "../../services/UnitOfMeasureService";
import MasterTab from "./MasterTab";
import VariantTab from "./VariantTab";
import type { LocaleFieldValue, VariantFieldValue } from "./types";

type ProductFormFieldValues = {
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

const featureOptions: { key: ProductMasterFeatures; label: string }[] = [
  { key: ProductMasterFeatures.SALE, label: "Sale" },
  { key: ProductMasterFeatures.PURCHASE, label: "Purchase" },
  { key: ProductMasterFeatures.MANUFACTURE, label: "Manufacture" },
  { key: ProductMasterFeatures.SUBCONTRACT, label: "Subcontract" },
  { key: ProductMasterFeatures.STOCKABLE, label: "Stockable" },
  { key: ProductMasterFeatures.MAINTENANCE, label: "Maintenance" },
  { key: ProductMasterFeatures.ASSET, label: "Asset" },
  { key: ProductMasterFeatures.ACCOUNTING, label: "Accounting" },
];

const masterTypes: SelectItemOption[] = [
  { value: ProductMasterType.GOODS, label: "Goods" },
  { value: ProductMasterType.SERVICE, label: "Service" },
  { value: ProductMasterType.FINISHED_GOOD, label: "Finished good" },
  { value: ProductMasterType.RAW_MATERIAL, label: "Raw material" },
  { value: ProductMasterType.CONSUMABLE, label: "Consumable" },
  { value: ProductMasterType.ASSET, label: "Asset" },
  { value: ProductMasterType.TOOL, label: "Tool" },
];

const defaultLocaleValue = (): LocaleFieldValue => ({ en: "", vi: "" });

const createDefaultVariant = (): VariantFieldValue => ({
  name: defaultLocaleValue(),
  description: "",
  sku: "",
  barcode: "",
  manufacturerName: "",
  manufacturerCode: "",
  baseUomId: undefined,
  isActive: true,
  packings: [],
  attributes: [],
});

const createDefaultValues = (): ProductFormFieldValues => ({
  master: {
    code: "",
    name: defaultLocaleValue(),
    description: "",
    type: ProductMasterType.GOODS,
    features: featureOptions.reduce(
      (acc, feature) => ({
        ...acc,
        [feature.key]: feature.key === ProductMasterFeatures.SALE,
      }),
      {} as Record<ProductMasterFeatures, boolean>
    ),
    isActive: true,
    brand: "",
    categoryId: undefined,
  },
  variants: [createDefaultVariant()],
});

const buildHierarchyOptions = (categories: ProductCategoryRow[]) => {
  const grouped = new Map<string | null, ProductCategoryRow[]>();

  categories.forEach((category) => {
    const parentKey = category.parent?.id ?? null;
    const siblings = grouped.get(parentKey) ?? [];
    siblings.push(category);
    grouped.set(parentKey, siblings);
  });

  const results: { id: string; label: string; level: number }[] = [];

  const traverse = (parentKey: string | null, depth: number) => {
    const nodes = grouped.get(parentKey);
    if (!nodes) return;

    nodes.forEach((node) => {
      const prefix = depth > 1 ? `${"―".repeat(depth - 1)} ` : "";
      const label = typeof node.name === "string" ? node.name : node.code;
      results.push({
        id: node.id,
        label: `${prefix}${label ?? node.id}`,
        level: depth,
      });
      traverse(node.id, depth + 1);
    });
  };

  traverse(null, 1);

  return results;
};

interface ProductFormProps {
  title: string;
  subtitle?: string;
  submitLabel?: string;
  secondarySubmitLabel?: string;
  loading?: boolean;
  initialValues?: ProductFormValues;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  onSubmitAndContinue?: (values: ProductFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

const ensureLocaleValue = (
  value?: LocaleFormValue | null
): LocaleFieldValue => ({
  en: value?.en ?? "",
  vi: value?.vi ?? "",
});

const toLocaleFormValue = (value: LocaleFieldValue): LocaleFormValue => ({
  en: value.en.trim() ? value.en : undefined,
  vi: value.vi.trim() ? value.vi : undefined,
});

const mapToFieldValues = (
  initialValues?: ProductFormValues
): ProductFormFieldValues => {
  const defaults = createDefaultValues();

  if (!initialValues) {
    return defaults;
  }

  const featureState = featureOptions.reduce(
    (acc, feature) => ({
      ...acc,
      [feature.key]:
        initialValues.master.features?.[feature.key] ??
        defaults.master.features[feature.key],
    }),
    {} as Record<ProductMasterFeatures, boolean>
  );

  // Map single variant from initialValues to variants array
  const variant: VariantFieldValue = {
    name: ensureLocaleValue(initialValues.variant.name),
    description:
      typeof initialValues.variant.description === "string"
        ? initialValues.variant.description
        : "",
    sku: initialValues.variant.sku ?? "",
    barcode: initialValues.variant.barcode ?? "",
    manufacturerName:
      typeof initialValues.variant.manufacturerName === "string"
        ? initialValues.variant.manufacturerName
        : "",
    manufacturerCode: initialValues.variant.manufacturerCode ?? "",
    baseUomId: initialValues.variant.baseUomId ?? undefined,
    isActive: initialValues.variant.isActive ?? true,
    packings:
      initialValues.packings?.map((packing) => ({
        id: packing.id,
        name: ensureLocaleValue(packing.name),
        description: ensureLocaleValue(packing.description),
        isActive: packing.isActive ?? true,
      })) ?? [],
    attributes:
      initialValues.attributes?.map((attribute) => ({
        id: attribute.id,
        code: attribute.code ?? "",
        name: ensureLocaleValue(attribute.name),
        value: attribute.value ?? "",
      })) ?? [],
  };

  return {
    master: {
      code: initialValues.master.code ?? "",
      name: ensureLocaleValue(initialValues.master.name),
      description:
        typeof initialValues.master.description === "string"
          ? initialValues.master.description
          : "",
      type: initialValues.master.type || ProductMasterType.GOODS,
      features: featureState,
      isActive: initialValues.master.isActive ?? true,
      brand:
        typeof initialValues.master.brand === "string"
          ? initialValues.master.brand
          : "",
      categoryId: initialValues.master.categoryId ?? undefined,
    },
    variants: [variant],
  };
};

const mapToProductFormValues = (
  values: ProductFormFieldValues
): ProductFormValues => {
  // Take the first variant for now (API expects single variant)
  const firstVariant = values.variants[0] || createDefaultVariant();

  return {
    master: {
      code: values.master.code,
      name: toLocaleFormValue(values.master.name),
      description: values.master.description.trim() || "",
      type: values.master.type,
      features: values.master.features,
      isActive: values.master.isActive,
      brand: values.master.brand.trim() || "",
      categoryId: values.master.categoryId,
    },
    variant: {
      name: toLocaleFormValue(firstVariant.name),
      description: firstVariant.description.trim() || "",
      sku: firstVariant.sku,
      barcode: firstVariant.barcode,
      manufacturerName: firstVariant.manufacturerName.trim() || "",
      manufacturerCode: firstVariant.manufacturerCode,
      baseUomId: firstVariant.baseUomId,
      isActive: firstVariant.isActive,
    },
    packings: firstVariant.packings.map((packing) => ({
      id: packing.id,
      name: toLocaleFormValue(packing.name),
      description: toLocaleFormValue(packing.description),
      isActive: packing.isActive,
    })),
    attributes: firstVariant.attributes.map((attribute) => ({
      id: attribute.id,
      code: attribute.code,
      name: toLocaleFormValue(attribute.name),
      value: attribute.value,
    })),
  };
};

const localeSchema = object({
  en: fallback(pipe(string(), trim()), ""),
  vi: fallback(pipe(string(), trim()), ""),
});

const localeRequiredSchema = object({
  en: pipe(
    fallback(pipe(string(), trim()), ""),
    minLength(1, "English name is required")
  ),
  vi: fallback(pipe(string(), trim()), ""),
});

const productFeatureValues = featureOptions.map((feature) => feature.key) as [
  ProductMasterFeatures,
  ...ProductMasterFeatures[],
];

const featuresSchema = record(picklist(productFeatureValues), boolean());

const productMasterTypeValues = Object.values(ProductMasterType) as [
  ProductMasterType,
  ...ProductMasterType[],
];

const variantSchema = object({
  name: localeRequiredSchema,
  description: fallback(pipe(string(), trim()), ""),
  sku: pipe(string(), trim(), minLength(1, "SKU is required")),
  barcode: pipe(string(), trim(), minLength(1, "Barcode is required")),
  manufacturerName: fallback(pipe(string(), trim()), ""),
  manufacturerCode: pipe(string(), trim()),
  baseUomId: pipe(
    string(),
    trim(),
    minLength(1, "Base unit of measure is required")
  ),
  isActive: boolean(),
  packings: array(
    object({
      id: optional(pipe(string(), trim())),
      name: localeSchema,
      description: localeSchema,
      isActive: boolean(),
    })
  ),
  attributes: array(
    object({
      id: optional(pipe(string(), trim())),
      code: pipe(string(), trim()),
      name: localeSchema,
      value: pipe(string(), trim()),
    })
  ),
});

const productFormSchema = object({
  master: object({
    code: pipe(string(), trim(), minLength(1, "Product code is required")),
    name: localeRequiredSchema,
    description: fallback(pipe(string(), trim()), ""),
    type: picklist(productMasterTypeValues),
    features: featuresSchema,
    isActive: boolean(),
    brand: fallback(pipe(string(), trim()), ""),
    categoryId: optional(pipe(string(), trim())),
  }),
  variants: pipe(
    array(variantSchema),
    minLength(1, "At least one variant is required"),
    maxLength(20, "Maximum 20 variants allowed")
  ),
});

export default function ProductForm({
  title,
  subtitle,
  submitLabel = "Save",
  secondarySubmitLabel,
  loading = false,
  initialValues,
  onSubmit,
  onSubmitAndContinue,
  onCancel,
}: ProductFormProps) {
  const {
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormFieldValues>({
    defaultValues: mapToFieldValues(initialValues),
    resolver: valibotResolver(
      productFormSchema
    ) as Resolver<ProductFormFieldValues>,
  });

  useEffect(() => {
    reset(mapToFieldValues(initialValues));
  }, [initialValues, reset]);

  const categoryQuery = useQuery({
    queryKey: ["product-category-tree"],
    queryFn: () => ProductCategoryService.fetchTree(),
  });

  const uomQuery = useQuery({
    queryKey: ["product-uom"],
    queryFn: () => UnitOfMeasureService.getList(),
  });

  const categoryOptions = useMemo<SelectItemOption[]>(() => {
    if (!categoryQuery.data) return [];
    return buildHierarchyOptions(categoryQuery.data).map((option) => ({
      value: option.id,
      label: option.label,
    }));
  }, [categoryQuery.data]);

  const uomOptions = useMemo<SelectItemOption[]>(() => {
    if (!uomQuery.data?.data) return [];
    return uomQuery.data.data.map((uom) => ({
      value: uom.id,
      label:
        typeof uom.name === "string"
          ? uom.name
          : ((uom.name as Record<string, string>)?.en ?? uom.symbol ?? uom.id),
    }));
  }, [uomQuery.data]);

  // Watch only specific fields instead of entire form to improve performance
  const masterCode = useWatch({ control, name: "master.code" });
  const masterType = useWatch({ control, name: "master.type" });
  const masterName = useWatch({ control, name: "master.name" });
  const masterCategoryId = useWatch({ control, name: "master.categoryId" });
  const masterDescription = useWatch({ control, name: "master.description" });
  const masterBrand = useWatch({ control, name: "master.brand" });
  const masterFeatures = useWatch({ control, name: "master.features" });
  const variants = useWatch({ control, name: "variants" });
  const [selectedTab, setSelectedTab] = useState<string>("master");

  const isBusy = loading || isSubmitting;

  const handleFeatureToggle = useCallback(
    (selected: Set<string>) => {
      const nextFeatures = featureOptions.reduce(
        (acc, feature) => ({
          ...acc,
          [feature.key]: selected.has(feature.key),
        }),
        {} as Record<ProductMasterFeatures, boolean>
      );

      setValue("master.features", nextFeatures, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue]
  );

  const addVariant = useCallback(() => {
    const currentVariants = getValues("variants");
    if (currentVariants.length >= 20) return;
    const newIndex = currentVariants.length;
    setValue("variants", [...currentVariants, createDefaultVariant()], {
      shouldDirty: true,
      shouldValidate: true,
    });
    // Switch to the new variant tab
    setSelectedTab(`variant-${newIndex}`);
  }, [getValues, setValue]);

  const removeVariant = useCallback(
    (index: number) => {
      const currentVariants = getValues("variants");
      if (currentVariants.length <= 1) return; // At least one variant required
      const newVariants = currentVariants.filter((_, idx) => idx !== index);
      setValue("variants", newVariants, {
        shouldDirty: true,
        shouldValidate: true,
      });
      // If we're on the removed tab, switch to master or another variant
      if (selectedTab === `variant-${index}`) {
        if (index === 0 && newVariants.length > 0) {
          setSelectedTab("variant-0");
        } else if (index > 0) {
          setSelectedTab(`variant-${index - 1}`);
        } else {
          setSelectedTab("master");
        }
      }
    },
    [getValues, setValue, selectedTab]
  );

  const updateVariant = useCallback(
    (
      variantIndex: number,
      updater: (current: VariantFieldValue) => VariantFieldValue
    ) => {
      const currentVariants = getValues("variants");
      const nextVariants = currentVariants.map((variant, idx) =>
        idx === variantIndex ? updater(variant) : variant
      );
      setValue("variants", nextVariants, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [getValues, setValue]
  );

  const updatePacking = useCallback(
    (
      variantIndex: number,
      packingIndex: number,
      updater: (
        current: VariantFieldValue["packings"][number]
      ) => VariantFieldValue["packings"][number]
    ) => {
      updateVariant(variantIndex, (variant) => ({
        ...variant,
        packings: variant.packings.map((item, idx) =>
          idx === packingIndex ? updater(item) : item
        ),
      }));
    },
    [updateVariant]
  );

  const addPacking = useCallback(
    (variantIndex: number) => {
      updateVariant(variantIndex, (variant) => ({
        ...variant,
        packings: [
          ...variant.packings,
          {
            id: undefined,
            name: defaultLocaleValue(),
            description: defaultLocaleValue(),
            isActive: true,
          },
        ],
      }));
    },
    [updateVariant]
  );

  const removePacking = useCallback(
    (variantIndex: number, packingIndex: number) => {
      updateVariant(variantIndex, (variant) => ({
        ...variant,
        packings: variant.packings.filter((_, idx) => idx !== packingIndex),
      }));
    },
    [updateVariant]
  );

  const updateAttribute = useCallback(
    (
      variantIndex: number,
      attributeIndex: number,
      updater: (
        current: VariantFieldValue["attributes"][number]
      ) => VariantFieldValue["attributes"][number]
    ) => {
      updateVariant(variantIndex, (variant) => ({
        ...variant,
        attributes: variant.attributes.map((item, idx) =>
          idx === attributeIndex ? updater(item) : item
        ),
      }));
    },
    [updateVariant]
  );

  const addAttribute = useCallback(
    (variantIndex: number) => {
      updateVariant(variantIndex, (variant) => ({
        ...variant,
        attributes: [
          ...variant.attributes,
          {
            id: undefined,
            code: "",
            name: defaultLocaleValue(),
            value: "",
          },
        ],
      }));
    },
    [updateVariant]
  );

  const removeAttribute = useCallback(
    (variantIndex: number, attributeIndex: number) => {
      updateVariant(variantIndex, (variant) => ({
        ...variant,
        attributes: variant.attributes.filter(
          (_, idx) => idx !== attributeIndex
        ),
      }));
    },
    [updateVariant]
  );

  const handleValidSubmit: SubmitHandler<ProductFormFieldValues> = async (
    formValues
  ) => {
    await onSubmit(mapToProductFormValues(formValues));
  };

  const handleValidSubmitAndContinue: SubmitHandler<
    ProductFormFieldValues
  > = async (formValues) => {
    if (!onSubmitAndContinue) {
      return;
    }

    await onSubmitAndContinue(mapToProductFormValues(formValues));
    reset(createDefaultValues());
  };

  const submitForm = handleSubmit(handleValidSubmit);

  const submitAndContinueForm = onSubmitAndContinue
    ? handleSubmit(handleValidSubmitAndContinue)
    : undefined;

  return (
    <form className="flex flex-col gap-4" onSubmit={submitForm}>
      <Card>
        <CardBody className="space-y-4">
          <div className="flex gap-2 justify-between">
            <div className="justify-start">
              <Button
                size="sm"
                variant="light"
                color="primary"
                startContent={<Plus size={14} />}
                onPress={addVariant}
                isDisabled={isBusy || (variants?.length ?? 0) >= 20}
              >
                Add Variant
              </Button>
            </div>
            <div className="justify-end space-x-2">
              {onCancel ? (
                <Button
                  variant="light"
                  size="sm"
                  onPress={onCancel}
                  isDisabled={isBusy}
                >
                  Cancel
                </Button>
              ) : null}

              {onSubmitAndContinue ? (
                <Button
                  variant="bordered"
                  size="sm"
                  type="button"
                  onPress={
                    submitAndContinueForm
                      ? async () => {
                          await submitAndContinueForm();
                        }
                      : undefined
                  }
                  isDisabled={isBusy}
                >
                  {secondarySubmitLabel ?? "Save & add another"}
                </Button>
              ) : null}

              <Button
                color="primary"
                size="sm"
                type="submit"
                isLoading={isBusy}
                isDisabled={isBusy}
              >
                {submitLabel}
              </Button>
            </div>
          </div>

          <Tabs
            aria-label="Product form tabs"
            color="primary"
            // variant="bordered"
            size="sm"
            className="w-full"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            classNames={{
              tabList: "gap-0 overflow-x-auto mb-0",
              tab: "max-w-[80px]",
              tabContent: "max-w-[80px] truncate",
              base: "mb-0",
            }}
          >
            <Tab key="master" title="Master">
              <MasterTab
                value={{
                  name: masterName ?? { en: "", vi: "" },
                  code: masterCode ?? "",
                  categoryId: masterCategoryId,
                  brand: masterBrand ?? "",
                  type: masterType ?? ProductMasterType.GOODS,
                  description: masterDescription ?? "",
                  features: masterFeatures ?? {},
                  isActive: true,
                }}
                categoryOptions={categoryOptions}
                masterTypes={masterTypes}
                featureOptions={featureOptions}
                errors={errors.master}
                isBusy={isBusy}
                categoryQueryLoading={categoryQuery.isLoading}
                onUpdate={(updater) => {
                  const current = {
                    name: masterName ?? { en: "", vi: "" },
                    code: masterCode ?? "",
                    categoryId: masterCategoryId,
                    brand: masterBrand ?? "",
                    type: masterType ?? ProductMasterType.GOODS,
                    description: masterDescription ?? "",
                    features: masterFeatures ?? {},
                    isActive: true,
                  };
                  const updated = updater(current);
                  setValue("master", updated, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
            </Tab>

            {(variants ?? []).map((variant, variantIndex) => {
              const variantErrors = errors.variants?.[variantIndex];
              const tabTitle = variant.sku?.trim()
                ? variant.sku
                : `Variant ${variantIndex + 1}`;
              // Truncate title if too long (approximately 50px = ~10-12 chars)
              const truncatedTitle =
                tabTitle.length > 12
                  ? `${tabTitle.substring(0, 12)}...`
                  : tabTitle;
              return (
                <Tab key={`variant-${variantIndex}`} title={truncatedTitle}>
                  <VariantTab
                    value={variant}
                    variantIndex={variantIndex}
                    variantErrors={variantErrors as any}
                    uomOptions={uomOptions}
                    isBusy={isBusy}
                    uomQueryLoading={uomQuery.isLoading}
                    canRemove={(variants?.length ?? 0) > 1}
                    onRemove={() => removeVariant(variantIndex)}
                    onUpdate={(updater) => updateVariant(variantIndex, updater)}
                  />
                </Tab>
              );
            })}
          </Tabs>
        </CardBody>
      </Card>
    </form>
  );
}
