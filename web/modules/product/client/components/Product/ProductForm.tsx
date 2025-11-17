"use client";

import {
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseSelectWithSearch,
  SelectItemOption,
} from "@base/client/components";
import { Button } from "@heroui/button";
import {
  Card,
  CardBody,
  Checkbox,
  CheckboxGroup,
  Divider,
  Switch,
  Textarea,
} from "@heroui/react";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import type { Resolver, SubmitHandler } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import {
  array,
  boolean,
  fallback,
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

type LocaleFieldValue = {
  en: string;
  vi: string;
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
  variant: {
    name: LocaleFieldValue;
    description: string;
    sku: string;
    barcode: string;
    manufacturerName: string;
    manufacturerCode: string;
    baseUomId?: string;
    isActive: boolean;
  };
  packings: Array<{
    id?: string;
    name: LocaleFieldValue;
    description: LocaleFieldValue;
    isActive: boolean;
  }>;
  attributes: Array<{
    id?: string;
    code: string;
    name: LocaleFieldValue;
    value: string;
  }>;
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
  variant: {
    name: defaultLocaleValue(),
    description: "",
    sku: "",
    barcode: "",
    manufacturerName: "",
    manufacturerCode: "",
    baseUomId: undefined,
    isActive: true,
  },
  packings: [],
  attributes: [],
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

const updateLocaleValue = (
  value: LocaleFieldValue,
  locale: keyof LocaleFieldValue,
  next: string
): LocaleFieldValue => ({
  ...value,
  [locale]: next,
});

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
    variant: {
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
    },
    packings:
      initialValues.packings?.map((packing) => ({
        id: packing.id,
        name: ensureLocaleValue(packing.name),
        description: ensureLocaleValue(packing.description),
        isActive: packing.isActive ?? true,
      })) ?? defaults.packings,
    attributes:
      initialValues.attributes?.map((attribute) => ({
        id: attribute.id,
        code: attribute.code ?? "",
        name: ensureLocaleValue(attribute.name),
        value: attribute.value ?? "",
      })) ?? defaults.attributes,
  };
};

const mapToProductFormValues = (
  values: ProductFormFieldValues
): ProductFormValues => {
  // This function receives the full form values, so we can use it directly
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
      name: toLocaleFormValue(values.variant.name),
      description: values.variant.description.trim() || "",
      sku: values.variant.sku,
      barcode: values.variant.barcode,
      manufacturerName: values.variant.manufacturerName.trim() || "",
      manufacturerCode: values.variant.manufacturerCode,
      baseUomId: values.variant.baseUomId,
      isActive: values.variant.isActive,
    },
    packings: values.packings.map((packing) => ({
      id: packing.id,
      name: toLocaleFormValue(packing.name),
      description: toLocaleFormValue(packing.description),
      isActive: packing.isActive,
    })),
    attributes: values.attributes.map((attribute) => ({
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
  variant: object({
    name: localeSchema,
    description: fallback(pipe(string(), trim()), ""),
    sku: pipe(string(), trim()),
    barcode: pipe(string(), trim()),
    manufacturerName: fallback(pipe(string(), trim()), ""),
    manufacturerCode: pipe(string(), trim()),
    baseUomId: optional(pipe(string(), trim())),
    isActive: boolean(),
  }),
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
  const masterIsActive = useWatch({ control, name: "master.isActive" });
  const variantName = useWatch({ control, name: "variant.name" });
  const variantDescription = useWatch({ control, name: "variant.description" });
  const variantSku = useWatch({ control, name: "variant.sku" });
  const variantBarcode = useWatch({ control, name: "variant.barcode" });
  const variantManufacturerName = useWatch({
    control,
    name: "variant.manufacturerName",
  });
  const variantManufacturerCode = useWatch({
    control,
    name: "variant.manufacturerCode",
  });
  const variantBaseUomId = useWatch({ control, name: "variant.baseUomId" });
  const variantIsActive = useWatch({ control, name: "variant.isActive" });
  const packings = useWatch({ control, name: "packings" });
  const attributes = useWatch({ control, name: "attributes" });

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

  const updatePacking = useCallback(
    (
      index: number,
      updater: (
        current: ProductFormFieldValues["packings"][number]
      ) => ProductFormFieldValues["packings"][number]
    ) => {
      const currentPackings = getValues("packings");
      const nextPackings = currentPackings.map((item, idx) =>
        idx === index ? updater(item) : item
      );

      setValue("packings", nextPackings, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [getValues, setValue]
  );

  const updateAttribute = useCallback(
    (
      index: number,
      updater: (
        current: ProductFormFieldValues["attributes"][number]
      ) => ProductFormFieldValues["attributes"][number]
    ) => {
      const currentAttributes = getValues("attributes");
      const nextAttributes = currentAttributes.map((item, idx) =>
        idx === index ? updater(item) : item
      );

      setValue("attributes", nextAttributes, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [getValues, setValue]
  );

  const addPacking = useCallback(() => {
    const currentPackings = getValues("packings");
    setValue(
      "packings",
      [
        ...currentPackings,
        {
          id: undefined,
          name: defaultLocaleValue(),
          description: defaultLocaleValue(),
          isActive: true,
        },
      ],
      { shouldDirty: true, shouldValidate: true }
    );
  }, [getValues, setValue]);

  const removePacking = useCallback(
    (index: number) => {
      const currentPackings = getValues("packings");
      setValue(
        "packings",
        currentPackings.filter((_, idx) => idx !== index),
        { shouldDirty: true, shouldValidate: true }
      );
    },
    [getValues, setValue]
  );

  const addAttribute = useCallback(() => {
    const currentAttributes = getValues("attributes");
    setValue(
      "attributes",
      [
        ...currentAttributes,
        {
          id: undefined,
          code: "",
          name: defaultLocaleValue(),
          value: "",
        },
      ],
      { shouldDirty: true, shouldValidate: true }
    );
  }, [getValues, setValue]);

  const removeAttribute = useCallback(
    (index: number) => {
      const currentAttributes = getValues("attributes");
      setValue(
        "attributes",
        currentAttributes.filter((_, idx) => idx !== index),
        { shouldDirty: true, shouldValidate: true }
      );
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
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle ? (
              <p className="text-small text-default-500">{subtitle}</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <IBaseInput
              label="Product code"
              value={masterCode ?? ""}
              onValueChange={(next) =>
                setValue("master.code", next, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              isRequired
              isInvalid={Boolean(errors.master?.code)}
              errorMessage={errors.master?.code?.message}
              isDisabled={isBusy}
            />
            <IBaseSelectWithSearch
              label="Product type"
              items={masterTypes}
              selectedKeys={masterType ? [masterType] : []}
              onSelectionChange={(keys) => {
                const keySet = keys as Set<string>;
                const [first] = Array.from(keySet);
                const next =
                  (first as ProductMasterType) || ProductMasterType.GOODS;
                setValue("master.type", next, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              isInvalid={Boolean(errors.master?.type)}
              errorMessage={errors.master?.type?.message}
              isDisabled={isBusy}
            />
            <IBaseInputMultipleLang
              label="Name"
              value={masterName}
              onValueChange={(langs) =>
                setValue("master.name", langs as LocaleFieldValue, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              isRequired
              isInvalid={Boolean(errors.master?.name?.en)}
              errorMessage={errors.master?.name?.en?.message}
              isDisabled={isBusy}
            />
          </div>

          <Textarea
            label="Description"
            value={masterDescription ?? ""}
            onValueChange={(next) =>
              setValue("master.description", next, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            isDisabled={isBusy}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <IBaseSelectWithSearch
              label="Category"
              items={categoryOptions}
              selectedKeys={masterCategoryId ? [masterCategoryId] : []}
              onSelectionChange={(keys) => {
                const keySet = keys as Set<string>;
                const [first] = Array.from(keySet);
                const nextValue =
                  typeof first === "string" && first.length > 0
                    ? first
                    : undefined;
                setValue("master.categoryId", nextValue, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              isLoading={categoryQuery.isLoading}
              isInvalid={Boolean(errors.master?.categoryId)}
              errorMessage={errors.master?.categoryId?.message}
              isDisabled={isBusy || categoryQuery.isLoading}
            />

            <IBaseInput
              label="Brand"
              value={masterBrand ?? ""}
              onValueChange={(next) =>
                setValue("master.brand", next, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              isDisabled={isBusy}
            />
          </div>

          <CheckboxGroup
            label="Product features"
            orientation="horizontal"
            value={featureOptions
              .filter((feature) => masterFeatures?.[feature.key])
              .map((feature) => feature.key)}
            onChange={(selected) =>
              handleFeatureToggle(new Set(selected as string[]))
            }
            classNames={{ wrapper: "flex flex-wrap gap-3" }}
            isDisabled={isBusy}
          >
            {featureOptions.map((feature) => (
              <Checkbox
                key={feature.key}
                value={feature.key}
                isDisabled={isBusy}
              >
                {feature.label}
              </Checkbox>
            ))}
          </CheckboxGroup>

          <Switch
            isSelected={masterIsActive ?? false}
            onValueChange={(next) =>
              setValue("master.isActive", next, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            isDisabled={isBusy}
          >
            Master active
          </Switch>

          <Divider />

          <div className="grid gap-4 md:grid-cols-2">
            <IBaseInput
              label="Variant name (English)"
              value={variantName?.en ?? ""}
              onValueChange={(next) =>
                setValue(
                  "variant.name",
                  updateLocaleValue(
                    variantName ?? { en: "", vi: "" },
                    "en",
                    next
                  ),
                  { shouldDirty: true, shouldValidate: true }
                )
              }
              isRequired
              isInvalid={Boolean(errors.variant?.name?.en)}
              errorMessage={errors.variant?.name?.en?.message}
              isDisabled={isBusy}
            />
            <IBaseInput
              label="Variant name (Vietnamese)"
              value={variantName?.vi ?? ""}
              onValueChange={(next) =>
                setValue(
                  "variant.name",
                  updateLocaleValue(
                    variantName ?? { en: "", vi: "" },
                    "vi",
                    next
                  ),
                  { shouldDirty: true, shouldValidate: true }
                )
              }
              isDisabled={isBusy}
            />
            <Textarea
              label="Variant description"
              value={variantDescription ?? ""}
              onValueChange={(next) =>
                setValue("variant.description", next, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              isDisabled={isBusy}
            />
            <IBaseInput
              label="SKU"
              value={variantSku ?? ""}
              onValueChange={(next) =>
                setValue("variant.sku", next, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              isDisabled={isBusy}
            />
            <IBaseInput
              label="Barcode"
              value={variantBarcode ?? ""}
              onValueChange={(next) =>
                setValue("variant.barcode", next, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              isDisabled={isBusy}
            />
            <IBaseInput
              label="Manufacturer name"
              value={variantManufacturerName ?? ""}
              onValueChange={(next) =>
                setValue("variant.manufacturerName", next, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              isDisabled={isBusy}
            />
            <IBaseInput
              label="Manufacturer code"
              value={variantManufacturerCode ?? ""}
              onValueChange={(next) =>
                setValue("variant.manufacturerCode", next, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              isDisabled={isBusy}
            />
            <IBaseSelectWithSearch
              label="Base unit of measure"
              items={uomOptions}
              selectedKeys={variantBaseUomId ? [variantBaseUomId] : []}
              onSelectionChange={(keys) => {
                const keySet = keys as Set<string>;
                const [first] = Array.from(keySet);
                const nextValue =
                  typeof first === "string" && first.length > 0
                    ? first
                    : undefined;
                setValue("variant.baseUomId", nextValue, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              isLoading={uomQuery.isLoading}
              isInvalid={Boolean(errors.variant?.baseUomId)}
              errorMessage={errors.variant?.baseUomId?.message}
              isDisabled={isBusy || uomQuery.isLoading}
            />
          </div>

          <Switch
            isSelected={variantIsActive ?? false}
            onValueChange={(next) =>
              setValue("variant.isActive", next, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            isDisabled={isBusy}
          >
            Variant active
          </Switch>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Packings</h2>
              <p className="text-small text-default-500">
                Define packaging options associated with this product.
              </p>
            </div>
            <Button
              size="sm"
              variant="bordered"
              startContent={<Plus size={14} />}
              onPress={addPacking}
              isDisabled={isBusy}
            >
              Add packing
            </Button>
          </div>

          {!packings || packings.length === 0 ? (
            <p className="text-small text-default-500">
              No packing entries yet.
            </p>
          ) : (
            <div className="space-y-4">
              {(packings ?? []).map((packing, index) => (
                <Card key={index} className="border border-default-200">
                  <CardBody className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-medium font-medium">
                        Packing #{index + 1}
                      </h3>
                      <Button
                        size="sm"
                        variant="light"
                        startContent={<Trash size={14} />}
                        onPress={() => removePacking(index)}
                        isDisabled={isBusy}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <IBaseInput
                        label="Name (English)"
                        value={packing.name.en ?? ""}
                        onValueChange={(next) =>
                          updatePacking(index, (current) => ({
                            ...current,
                            name: updateLocaleValue(current.name, "en", next),
                          }))
                        }
                        isDisabled={isBusy}
                      />
                      <IBaseInput
                        label="Name (Vietnamese)"
                        value={packing.name.vi ?? ""}
                        onValueChange={(next) =>
                          updatePacking(index, (current) => ({
                            ...current,
                            name: updateLocaleValue(current.name, "vi", next),
                          }))
                        }
                        isDisabled={isBusy}
                      />
                    </div>
                    <Textarea
                      label="Description (English)"
                      value={packing.description?.en ?? ""}
                      onValueChange={(next) =>
                        updatePacking(index, (current) => ({
                          ...current,
                          description: updateLocaleValue(
                            current.description,
                            "en",
                            next
                          ),
                        }))
                      }
                      isDisabled={isBusy}
                    />
                    <Textarea
                      label="Description (Vietnamese)"
                      value={packing.description?.vi ?? ""}
                      onValueChange={(next) =>
                        updatePacking(index, (current) => ({
                          ...current,
                          description: updateLocaleValue(
                            current.description,
                            "vi",
                            next
                          ),
                        }))
                      }
                      isDisabled={isBusy}
                    />
                    <Switch
                      isSelected={packing.isActive}
                      onValueChange={(next) =>
                        updatePacking(index, (current) => ({
                          ...current,
                          isActive: next,
                        }))
                      }
                      isDisabled={isBusy}
                    >
                      Packing active
                    </Switch>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Attributes</h2>
              <p className="text-small text-default-500">
                Capture additional attributes such as color, material, or size.
              </p>
            </div>
            <Button
              size="sm"
              variant="bordered"
              startContent={<Plus size={14} />}
              onPress={addAttribute}
              isDisabled={isBusy}
            >
              Add attribute
            </Button>
          </div>

          {!attributes || attributes.length === 0 ? (
            <p className="text-small text-default-500">
              No attribute entries yet.
            </p>
          ) : (
            <div className="space-y-4">
              {(attributes ?? []).map((attribute, index) => (
                <Card key={index} className="border border-default-200">
                  <CardBody className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-medium font-medium">
                        Attribute #{index + 1}
                      </h3>
                      <Button
                        size="sm"
                        variant="light"
                        startContent={<Trash size={14} />}
                        onPress={() => removeAttribute(index)}
                        isDisabled={isBusy}
                      >
                        Remove
                      </Button>
                    </div>
                    <IBaseInput
                      label="Code"
                      value={attribute.code}
                      onValueChange={(next) =>
                        updateAttribute(index, (current) => ({
                          ...current,
                          code: next,
                        }))
                      }
                      isInvalid={Boolean(errors.attributes?.[index]?.code)}
                      errorMessage={errors.attributes?.[index]?.code?.message}
                      isDisabled={isBusy}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <IBaseInput
                        label="Name (English)"
                        value={attribute.name.en ?? ""}
                        onValueChange={(next) =>
                          updateAttribute(index, (current) => ({
                            ...current,
                            name: updateLocaleValue(current.name, "en", next),
                          }))
                        }
                        isDisabled={isBusy}
                      />
                      <IBaseInput
                        label="Name (Vietnamese)"
                        value={attribute.name.vi ?? ""}
                        onValueChange={(next) =>
                          updateAttribute(index, (current) => ({
                            ...current,
                            name: updateLocaleValue(current.name, "vi", next),
                          }))
                        }
                        isDisabled={isBusy}
                      />
                    </div>
                    <IBaseInput
                      label="Value"
                      value={attribute.value}
                      onValueChange={(next) =>
                        updateAttribute(index, (current) => ({
                          ...current,
                          value: next,
                        }))
                      }
                      isInvalid={Boolean(errors.attributes?.[index]?.value)}
                      errorMessage={errors.attributes?.[index]?.value?.message}
                      isDisabled={isBusy}
                    />
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
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
    </form>
  );
}
