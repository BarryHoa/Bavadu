"use client";

import { SelectItemOption } from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { Button } from "@heroui/button";
import { Card, CardBody, Tooltip } from "@heroui/react";
import { Tab, Tabs } from "@heroui/tabs";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
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
import ProductService from "../../services/ProductService";
import UnitOfMeasureService from "../../services/UnitOfMeasureService";
import {
  FORBIDDEN_FEATURES_BY_TYPE,
  REQUIRED_FEATURES_BY_TYPE,
  getDefaultFeaturesForType,
} from "../../utils/product-features-validator";
import MasterTab from "./MasterTab";
import ProductFormGuideModal from "./ProductFormGuideModal";
import VariantTab from "./VariantTab";
import type { LocaleFieldValue, VariantFieldValue } from "./types";

/**
 * Get features for a product type based on constraints
 * @param productType - The product type
 * @param featureOptions - Available feature options
 * @param currentFeatures - Current features state (optional)
 * @returns New features object with required/forbidden features applied
 */
const getFeaturesByProductType = (
  productType: ProductMasterType,
  featureOptions: { key: ProductMasterFeatures; label: string }[],
  currentFeatures?: Record<ProductMasterFeatures, boolean>
): Record<ProductMasterFeatures, boolean> => {
  const defaultFeatures = getDefaultFeaturesForType(productType);
  const requiredFeatures = REQUIRED_FEATURES_BY_TYPE[productType] || [];
  const forbiddenFeatures = FORBIDDEN_FEATURES_BY_TYPE[productType] || [];

  return featureOptions.reduce(
    (acc, feature) => {
      // If feature is required, set to true
      if (requiredFeatures.includes(feature.key)) {
        acc[feature.key] = true;
      }
      // If feature is forbidden, set to false
      else if (forbiddenFeatures.includes(feature.key)) {
        acc[feature.key] = false;
      }
      // Otherwise, keep current value or use default
      else {
        acc[feature.key] =
          currentFeatures?.[feature.key] ??
          defaultFeatures[feature.key] ??
          false;
      }
      return acc;
    },
    {} as Record<ProductMasterFeatures, boolean>
  );
};

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

// Helper function to create default values with feature options
const createDefaultValues = (
  featureOptions: { key: ProductMasterFeatures; label: string }[]
): ProductFormFieldValues => ({
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

// Helper to convert locale description to string (prefer English, fallback to Vietnamese)
const descriptionLocaleToString = (
  value?: LocaleFormValue | string | null
): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.en?.trim() || value.vi?.trim() || "";
};

// Helper function to map initial values with feature options
const mapToFieldValues = (
  initialValues: ProductFormValues | undefined,
  featureOptions: { key: ProductMasterFeatures; label: string }[]
): ProductFormFieldValues => {
  const defaults = createDefaultValues(featureOptions);

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
    description: initialValues.variant.description || "",
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
        description: descriptionLocaleToString(packing.description),
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
      description: packing.description.trim() || "",
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

// Note: Validation messages will be translated in the component using t()
const createLocaleRequiredSchema = (t: (key: string) => string) =>
  object({
    en: pipe(
      fallback(pipe(string(), trim()), ""),
      minLength(1, t("errors.required"))
    ),
    vi: fallback(pipe(string(), trim()), ""),
  });

// Schema validation uses enum values directly
const productFeatureValues = Object.values(ProductMasterFeatures) as [
  ProductMasterFeatures,
  ...ProductMasterFeatures[],
];

const featuresSchema = record(picklist(productFeatureValues), boolean());

const productMasterTypeValues = Object.values(ProductMasterType) as [
  ProductMasterType,
  ...ProductMasterType[],
];

// Note: These schemas will be created inside the component to access t()
const createVariantSchema = (
  t: (key: string) => string,
  tProduct: (key: string) => string
) =>
  object({
    name: createLocaleRequiredSchema(t),
    description: fallback(pipe(string(), trim()), ""),
    sku: pipe(string(), trim(), minLength(1, t("errors.skuRequired"))),
    barcode: pipe(string(), trim(), minLength(1, t("errors.barcodeRequired"))),
    manufacturerName: fallback(pipe(string(), trim()), ""),
    manufacturerCode: pipe(string(), trim()),
    baseUomId: pipe(
      string(),
      trim(),
      minLength(1, tProduct("errors.baseUnitOfMeasureRequired"))
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

const createProductFormSchema = (
  t: (key: string) => string,
  tProduct: (key: string) => string,
  formatMessage: (
    key: string,
    values: Record<string, string | number>
  ) => string
) =>
  object({
    master: object({
      code: pipe(
        string(),
        trim(),
        minLength(1, tProduct("errors.productCodeRequired"))
      ),
      name: createLocaleRequiredSchema(t),
      description: fallback(pipe(string(), trim()), ""),
      type: picklist(productMasterTypeValues),
      features: featuresSchema,
      isActive: boolean(),
      brand: fallback(pipe(string(), trim()), ""),
      categoryId: optional(pipe(string(), trim())),
    }),
    variants: pipe(
      array(createVariantSchema(t, tProduct)),
      minLength(1, tProduct("errors.atLeastOneVariantRequired")),
      maxLength(20, formatMessage("errors.maxVariantsAllowed", { count: 20 }))
    ),
  });

export default function ProductForm({
  submitLabel,
  secondarySubmitLabel,
  loading = false,
  initialValues,
  onSubmit,
  onSubmitAndContinue,
  onCancel,
}: ProductFormProps) {
  const getLocalizedText = useLocalizedText();
  const t = useTranslations("common");
  const tProduct = useTranslations("mdl-product");

  // Helper to format messages with variables
  // next-intl's useTranslations supports variables as second parameter
  const formatMessage = useCallback(
    (key: string, values: Record<string, string | number>) => {
      // Type assertion to allow passing variables to next-intl translation function
      const tWithVars = tProduct as unknown as (
        key: string,
        values?: Record<string, string | number>
      ) => string;
      return tWithVars(key, values);
    },
    [tProduct]
  );

  const productTypesQuery = useQuery({
    queryKey: ["product-types"],
    queryFn: () => ProductService.getProductTypes(),
  });

  const productFeaturesQuery = useQuery({
    queryKey: ["product-features"],
    queryFn: () => ProductService.getProductFeatures(),
  });

  const featureOptions = useMemo(() => {
    if (!productFeaturesQuery.data?.data) {
      return [];
    }
    return productFeaturesQuery.data.data.map((option) => {
      const enumKey = Object.entries(ProductMasterFeatures).find(
        ([, value]) => value === option.key
      )?.[1] as ProductMasterFeatures | undefined;
      return {
        key: enumKey || (option.key as ProductMasterFeatures),
        label: tProduct(`productFeature.${option.key}`),
      };
    });
  }, [productFeaturesQuery.data]);

  const masterTypes = useMemo<SelectItemOption[]>(() => {
    if (!productTypesQuery.data?.data) {
      return [];
    }
    return productTypesQuery.data.data.map((type) => ({
      value: type.value,
      label: getLocalizedText(type.label as any) || type.value,
    }));
  }, [productTypesQuery.data]);

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormFieldValues>({
    defaultValues: mapToFieldValues(initialValues, featureOptions),
    resolver: valibotResolver(
      createProductFormSchema(t, tProduct, formatMessage)
    ) as unknown as Resolver<ProductFormFieldValues>,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    reset(mapToFieldValues(initialValues, featureOptions));
  }, [initialValues, reset, featureOptions]);

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
    const categories = Array.isArray(categoryQuery.data)
      ? categoryQuery.data
      : [];
    return buildHierarchyOptions(categories).map((option) => ({
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
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const isBusy = loading || isSubmitting;

  // Calculate disabled features based on product type
  const disabledFeatures = useMemo(() => {
    if (!masterType) return new Set<string>();
    const forbidden = FORBIDDEN_FEATURES_BY_TYPE[masterType] || [];
    return new Set(forbidden.map((f) => f));
  }, [masterType]);

  const addVariant = useCallback(() => {
    const currentVariants = getValues("variants");
    if (currentVariants.length >= 20) return;
    const newIndex = currentVariants.length;
    setValue("variants", [...currentVariants, createDefaultVariant()], {
      shouldDirty: true,
      shouldValidate: false,
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
        shouldValidate: false,
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
        shouldValidate: false,
      });
    },
    [getValues, setValue]
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
    reset(createDefaultValues(featureOptions));
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
                {t("actions.add")} {t("variant")}
              </Button>
            </div>
            <div className="justify-end flex items-center gap-2">
              <Tooltip content={tProduct("guideTooltip")} placement="top">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={() => setIsGuideModalOpen(true)}
                  isDisabled={isBusy}
                  aria-label={tProduct("guideAriaLabel")}
                >
                  <HelpCircle size={18} className="text-default-500" />
                </Button>
              </Tooltip>
              {onCancel ? (
                <Button
                  variant="light"
                  size="sm"
                  onPress={onCancel}
                  isDisabled={isBusy}
                >
                  {t("actions.cancel")}
                </Button>
              ) : null}

              {onSubmitAndContinue && submitAndContinueForm ? (
                <Button
                  variant="bordered"
                  size="sm"
                  type="button"
                  onPress={async () => {
                    await submitAndContinueForm();
                  }}
                  isDisabled={isBusy}
                >
                  {secondarySubmitLabel ??
                    `${t("actions.save")} & ${t("actions.add")} ${t("another")}`}
                </Button>
              ) : null}

              <Button
                color="primary"
                size="sm"
                type="submit"
                isLoading={isBusy}
                isDisabled={isBusy}
              >
                {submitLabel ?? t("actions.save")}
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
            <Tab key="master" title={t("master")}>
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
                disabledFeatures={disabledFeatures}
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

                  // If product type changed, reset features using getFeaturesByProductType
                  if (
                    updated.type !== current.type &&
                    featureOptions.length > 0
                  ) {
                    updated.features = getFeaturesByProductType(
                      updated.type,
                      featureOptions,
                      current.features
                    );
                  }

                  setValue("master", updated, {
                    shouldDirty: true,
                    shouldValidate: false,
                  });
                }}
              />
            </Tab>

            {(variants ?? []).map((variant, variantIndex) => {
              const variantErrors = errors.variants?.[variantIndex];
              const tabTitle =
                variant.sku?.trim() || `${t("variant")} ${variantIndex + 1}`;
              const truncatedTitle =
                tabTitle.length > 12
                  ? `${tabTitle.substring(0, 12)}...`
                  : tabTitle;
              return (
                <Tab key={`variant-${variantIndex}`} title={truncatedTitle}>
                  <VariantTab
                    value={variant}
                    masterFeatures={masterFeatures}
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

      <ProductFormGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </form>
  );
}
