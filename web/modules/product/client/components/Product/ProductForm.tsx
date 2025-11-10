"use client";

import Input from "@base/client/components/Input";
import { Button } from "@heroui/button";
import {
  Card,
  CardBody,
  Checkbox,
  CheckboxGroup,
  Divider,
  Select,
  SelectItem,
  Switch,
  Textarea,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  LocaleFormValue,
  ProductFormAttribute,
  ProductFormPacking,
  ProductFormValues,
  ProductMasterFeatures,
  ProductMasterType,
} from "../../interface/Product";
import type { ProductCategoryRow } from "../../interface/ProductCategory";
import ProductCategoryService from "../../services/ProductCategoryService";
import UnitOfMeasureService from "../../services/UnitOfMeasureService";

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

const masterTypes: { key: ProductMasterType; label: string }[] = [
  { key: ProductMasterType.GOODS, label: "Goods" },
  { key: ProductMasterType.SERVICE, label: "Service" },
  { key: ProductMasterType.FINISHED_GOOD, label: "Finished good" },
  { key: ProductMasterType.RAW_MATERIAL, label: "Raw material" },
  { key: ProductMasterType.CONSUMABLE, label: "Consumable" },
  { key: ProductMasterType.ASSET, label: "Asset" },
  { key: ProductMasterType.TOOL, label: "Tool" },
];

const defaultLocaleValue = (): LocaleFormValue => ({ en: "", vi: "" });

const createDefaultValues = (): ProductFormValues => ({
  master: {
    code: "",
    name: defaultLocaleValue(),
    description: defaultLocaleValue(),
    type: ProductMasterType.GOODS,
    features: featureOptions.reduce(
      (acc, feature) => ({
        ...acc,
        [feature.key]: feature.key === ProductMasterFeatures.SALE,
      }),
      {} as Record<ProductMasterFeatures, boolean>
    ),
    isActive: true,
    brand: defaultLocaleValue(),
    categoryId: undefined,
  },
  variant: {
    name: defaultLocaleValue(),
    description: defaultLocaleValue(),
    sku: "",
    barcode: "",
    manufacturerName: defaultLocaleValue(),
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
  value: LocaleFormValue,
  locale: keyof LocaleFormValue,
  next: string
): LocaleFormValue => ({
  ...value,
  [locale]: next,
});

const ensureLocaleValue = (
  value?: LocaleFormValue | null
): LocaleFormValue => ({
  en: value?.en ?? "",
  vi: value?.vi ?? "",
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
  const [values, setValues] = useState<ProductFormValues>(
    initialValues ?? createDefaultValues()
  );

  useEffect(() => {
    setValues(initialValues ?? createDefaultValues());
  }, [initialValues]);

  const categoryQuery = useQuery({
    queryKey: ["product-category-tree"],
    queryFn: () => ProductCategoryService.fetchTree(),
  });

  const uomQuery = useQuery({
    queryKey: ["product-uom"],
    queryFn: () => UnitOfMeasureService.getList(),
  });

  const categoryOptions = useMemo(() => {
    if (!categoryQuery.data) return [];
    return buildHierarchyOptions(categoryQuery.data);
  }, [categoryQuery.data]);

  const uomOptions = useMemo(() => uomQuery.data?.data ?? [], [uomQuery.data]);

  const handleFeatureToggle = (selected: Set<string>) => {
    setValues((prev) => ({
      ...prev,
      master: {
        ...prev.master,
        features: featureOptions.reduce(
          (acc, feature) => ({
            ...acc,
            [feature.key]: selected.has(feature.key),
          }),
          {} as Record<ProductMasterFeatures, boolean>
        ),
      },
    }));
  };

  const updatePacking = (
    index: number,
    updater: (current: ProductFormPacking) => ProductFormPacking
  ) => {
    setValues((prev) => ({
      ...prev,
      packings: prev.packings.map((item, idx) =>
        idx === index ? updater(item) : item
      ),
    }));
  };

  const updateAttribute = (
    index: number,
    updater: (current: ProductFormAttribute) => ProductFormAttribute
  ) => {
    setValues((prev) => ({
      ...prev,
      attributes: prev.attributes.map((item, idx) =>
        idx === index ? updater(item) : item
      ),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  const handleSubmitAndContinue = async () => {
    if (!onSubmitAndContinue) return;
    await onSubmitAndContinue(values);
    setValues(createDefaultValues());
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Card>
        <CardBody className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle ? (
              <p className="text-small text-default-500">{subtitle}</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Product code"
              value={values.master.code}
              onValueChange={(next) =>
                setValues((prev) => ({
                  ...prev,
                  master: { ...prev.master, code: next },
                }))
              }
              isRequired
              isDisabled={loading}
            />
            <Select
              label="Product type"
              selectedKeys={values.master.type ? [values.master.type] : []}
              onSelectionChange={(keys) => {
                const [first] = Array.from(keys);
                setValues((prev) => ({
                  ...prev,
                  master: {
                    ...prev.master,
                    type:
                      (first as ProductMasterType) || ProductMasterType.GOODS,
                  },
                }));
              }}
              isDisabled={loading}
            >
              {masterTypes.map((type) => (
                <SelectItem key={type.key}>{type.label}</SelectItem>
              ))}
            </Select>
            <Input
              label="Name (English)"
              value={values.master.name.en ?? ""}
              onValueChange={(next) =>
                setValues((prev) => ({
                  ...prev,
                  master: {
                    ...prev.master,
                    name: updateLocaleValue(
                      ensureLocaleValue(prev.master.name),
                      "en",
                      next
                    ),
                  },
                }))
              }
              isRequired
              isDisabled={loading}
            />
            <Input
              label="Name (Vietnamese)"
              value={values.master.name.vi ?? ""}
              onValueChange={(next) =>
                setValues((prev) => ({
                  ...prev,
                  master: {
                    ...prev.master,
                    name: updateLocaleValue(
                      ensureLocaleValue(prev.master.name),
                      "vi",
                      next
                    ),
                  },
                }))
              }
              isDisabled={loading}
            />
          </div>

          <Textarea
            label="Description (English)"
            value={values.master.description.en ?? ""}
            onValueChange={(next) =>
              setValues((prev) => ({
                ...prev,
                master: {
                  ...prev.master,
                  description: updateLocaleValue(
                    ensureLocaleValue(prev.master.description),
                    "en",
                    next
                  ),
                },
              }))
            }
            isDisabled={loading}
          />
          <Textarea
            label="Description (Vietnamese)"
            value={values.master.description.vi ?? ""}
            onValueChange={(next) =>
              setValues((prev) => ({
                ...prev,
                master: {
                  ...prev.master,
                  description: updateLocaleValue(
                    ensureLocaleValue(prev.master.description),
                    "vi",
                    next
                  ),
                },
              }))
            }
            isDisabled={loading}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Category"
              selectedKeys={
                values.master.categoryId ? [values.master.categoryId] : []
              }
              onSelectionChange={(keys) => {
                const [first] = Array.from(keys);
                setValues((prev) => ({
                  ...prev,
                  master: {
                    ...prev.master,
                    categoryId: typeof first === "string" ? first : undefined,
                  },
                }));
              }}
              isLoading={categoryQuery.isLoading}
              isDisabled={loading || categoryQuery.isLoading}
            >
              {categoryOptions.map((option) => (
                <SelectItem key={option.id}>{option.label}</SelectItem>
              ))}
            </Select>

            <Input
              label="Brand (English)"
              value={values.master.brand.en ?? ""}
              onValueChange={(next) =>
                setValues((prev) => ({
                  ...prev,
                  master: {
                    ...prev.master,
                    brand: updateLocaleValue(
                      ensureLocaleValue(prev.master.brand),
                      "en",
                      next
                    ),
                  },
                }))
              }
              isDisabled={loading}
            />
            <Input
              label="Brand (Vietnamese)"
              value={values.master.brand.vi ?? ""}
              onValueChange={(next) =>
                setValues((prev) => ({
                  ...prev,
                  master: {
                    ...prev.master,
                    brand: updateLocaleValue(
                      ensureLocaleValue(prev.master.brand),
                      "vi",
                      next
                    ),
                  },
                }))
              }
              isDisabled={loading}
            />
          </div>

          <CheckboxGroup
            label="Product features"
            orientation="horizontal"
            value={featureOptions
              .filter((feature) => values.master.features[feature.key])
              .map((feature) => feature.key)}
            onChange={(selected) =>
              handleFeatureToggle(new Set(selected as string[]))
            }
            classNames={{ wrapper: "flex flex-wrap gap-3" }}
          >
            {featureOptions.map((feature) => (
              <Checkbox
                key={feature.key}
                value={feature.key}
                isDisabled={loading}
              >
                {feature.label}
              </Checkbox>
            ))}
          </CheckboxGroup>

          <Switch
            isSelected={values.master.isActive}
            onValueChange={(next) =>
              setValues((prev) => ({
                ...prev,
                master: { ...prev.master, isActive: next },
              }))
            }
            isDisabled={loading}
          >
            Master active
          </Switch>

          <Divider />

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Variant name (English)"
              value={values.variant.name.en ?? ""}
              onValueChange={(next) =>
                setValues((prev) => ({
                  ...prev,
                  variant: {
                    ...prev.variant,
                    name: updateLocaleValue(
                      ensureLocaleValue(prev.variant.name),
                      "en",
                      next
                    ),
                  },
                }))
              }
              isRequired
              isDisabled={loading}
            />
            <Input
              label="Variant name (Vietnamese)"
              value={values.variant.name.vi ?? ""}
              onValueChange={(next) =>
                setValues((prev) => ({
                  ...prev,
                  variant: {
                    ...prev.variant,
                    name: updateLocaleValue(
                      ensureLocaleValue(prev.variant.name),
                      "vi",
                      next
                    ),
                  },
                }))
              }
              isDisabled={loading}
            />
            <Textarea
              label="Variant description (English)"
              value={values.variant.description.en ?? ""}
              onValueChange={(next) =>
                setValues((prev) => ({
                  ...prev,
                  variant: {
                    ...prev.variant,
                    description: updateLocaleValue(
                      ensureLocaleValue(prev.variant.description),
                      "en",
                      next
                    ),
                  },
                }))
              }
              isDisabled={loading}
            />
            <Textarea
              label="Variant description (Vietnamese)"
              value={values.variant.description.vi ?? ""}
              onValueChange={(next) =>
                setValues((prev) => ({
                  ...prev,
                  variant: {
                    ...prev.variant,
                    description: updateLocaleValue(
                      ensureLocaleValue(prev.variant.description),
                      "vi",
                      next
                    ),
                  },
                }))
              }
              isDisabled={loading}
            />
            <Input
              label="SKU"
              value={values.variant.sku}
              onValueChange={(next) =>
                setValues((prev) => ({
                  ...prev,
                  variant: { ...prev.variant, sku: next },
                }))
              }
              isDisabled={loading}
            />
            <Input
              label="Barcode"
              value={values.variant.barcode}
              onValueChange={(next) =>
                setValues((prev) => ({
                  ...prev,
                  variant: { ...prev.variant, barcode: next },
                }))
              }
              isDisabled={loading}
            />
            <Input
              label="Manufacturer name (English)"
              value={values.variant.manufacturerName.en ?? ""}
              onValueChange={(next) =>
                setValues((prev) => ({
                  ...prev,
                  variant: {
                    ...prev.variant,
                    manufacturerName: updateLocaleValue(
                      ensureLocaleValue(prev.variant.manufacturerName),
                      "en",
                      next
                    ),
                  },
                }))
              }
              isDisabled={loading}
            />
            <Input
              label="Manufacturer name (Vietnamese)"
              value={values.variant.manufacturerName.vi ?? ""}
              onValueChange={(next) =>
                setValues((prev) => ({
                  ...prev,
                  variant: {
                    ...prev.variant,
                    manufacturerName: updateLocaleValue(
                      ensureLocaleValue(prev.variant.manufacturerName),
                      "vi",
                      next
                    ),
                  },
                }))
              }
              isDisabled={loading}
            />
            <Input
              label="Manufacturer code"
              value={values.variant.manufacturerCode}
              onValueChange={(next) =>
                setValues((prev) => ({
                  ...prev,
                  variant: { ...prev.variant, manufacturerCode: next },
                }))
              }
              isDisabled={loading}
            />
            <Select
              label="Base unit of measure"
              selectedKeys={
                values.variant.baseUomId ? [values.variant.baseUomId] : []
              }
              onSelectionChange={(keys) => {
                const [first] = Array.from(keys);
                setValues((prev) => ({
                  ...prev,
                  variant: {
                    ...prev.variant,
                    baseUomId: typeof first === "string" ? first : undefined,
                  },
                }));
              }}
              isLoading={uomQuery.isLoading}
              isDisabled={loading || uomQuery.isLoading}
            >
              {uomOptions.map((uom) => (
                <SelectItem key={uom.id}>
                  {typeof uom.name === "string"
                    ? uom.name
                    : ((uom.name as Record<string, string>)?.en ??
                      uom.symbol ??
                      uom.id)}
                </SelectItem>
              ))}
            </Select>
          </div>

          <Switch
            isSelected={values.variant.isActive}
            onValueChange={(next) =>
              setValues((prev) => ({
                ...prev,
                variant: { ...prev.variant, isActive: next },
              }))
            }
            isDisabled={loading}
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
              onPress={() =>
                setValues((prev) => ({
                  ...prev,
                  packings: [
                    ...prev.packings,
                    {
                      id: undefined,
                      name: defaultLocaleValue(),
                      description: defaultLocaleValue(),
                      isActive: true,
                    },
                  ],
                }))
              }
              isDisabled={loading}
            >
              Add packing
            </Button>
          </div>

          {values.packings.length === 0 ? (
            <p className="text-small text-default-500">
              No packing entries yet.
            </p>
          ) : (
            <div className="space-y-4">
              {values.packings.map((packing, index) => (
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
                        onPress={() =>
                          setValues((prev) => ({
                            ...prev,
                            packings: prev.packings.filter(
                              (_, idx) => idx !== index
                            ),
                          }))
                        }
                        isDisabled={loading}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        label="Name (English)"
                        value={packing.name.en ?? ""}
                        onValueChange={(next) =>
                          updatePacking(index, (current) => ({
                            ...current,
                            name: updateLocaleValue(
                              ensureLocaleValue(current.name),
                              "en",
                              next
                            ),
                          }))
                        }
                        isDisabled={loading}
                      />
                      <Input
                        label="Name (Vietnamese)"
                        value={packing.name.vi ?? ""}
                        onValueChange={(next) =>
                          updatePacking(index, (current) => ({
                            ...current,
                            name: updateLocaleValue(
                              ensureLocaleValue(current.name),
                              "vi",
                              next
                            ),
                          }))
                        }
                        isDisabled={loading}
                      />
                    </div>
                    <Textarea
                      label="Description (English)"
                      value={packing.description?.en ?? ""}
                      onValueChange={(next) =>
                        updatePacking(index, (current) => ({
                          ...current,
                          description: updateLocaleValue(
                            ensureLocaleValue(current.description),
                            "en",
                            next
                          ),
                        }))
                      }
                      isDisabled={loading}
                    />
                    <Textarea
                      label="Description (Vietnamese)"
                      value={packing.description?.vi ?? ""}
                      onValueChange={(next) =>
                        updatePacking(index, (current) => ({
                          ...current,
                          description: updateLocaleValue(
                            ensureLocaleValue(current.description),
                            "vi",
                            next
                          ),
                        }))
                      }
                      isDisabled={loading}
                    />
                    <Switch
                      isSelected={packing.isActive}
                      onValueChange={(next) =>
                        updatePacking(index, (current) => ({
                          ...current,
                          isActive: next,
                        }))
                      }
                      isDisabled={loading}
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
              onPress={() =>
                setValues((prev) => ({
                  ...prev,
                  attributes: [
                    ...prev.attributes,
                    {
                      id: undefined,
                      code: "",
                      name: defaultLocaleValue(),
                      value: "",
                    },
                  ],
                }))
              }
              isDisabled={loading}
            >
              Add attribute
            </Button>
          </div>

          {values.attributes.length === 0 ? (
            <p className="text-small text-default-500">
              No attribute entries yet.
            </p>
          ) : (
            <div className="space-y-4">
              {values.attributes.map((attribute, index) => (
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
                        onPress={() =>
                          setValues((prev) => ({
                            ...prev,
                            attributes: prev.attributes.filter(
                              (_, idx) => idx !== index
                            ),
                          }))
                        }
                        isDisabled={loading}
                      >
                        Remove
                      </Button>
                    </div>
                    <Input
                      label="Code"
                      value={attribute.code}
                      onValueChange={(next) =>
                        updateAttribute(index, (current) => ({
                          ...current,
                          code: next,
                        }))
                      }
                      isDisabled={loading}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        label="Name (English)"
                        value={attribute.name.en ?? ""}
                        onValueChange={(next) =>
                          updateAttribute(index, (current) => ({
                            ...current,
                            name: updateLocaleValue(
                              ensureLocaleValue(current.name),
                              "en",
                              next
                            ),
                          }))
                        }
                        isDisabled={loading}
                      />
                      <Input
                        label="Name (Vietnamese)"
                        value={attribute.name.vi ?? ""}
                        onValueChange={(next) =>
                          updateAttribute(index, (current) => ({
                            ...current,
                            name: updateLocaleValue(
                              ensureLocaleValue(current.name),
                              "vi",
                              next
                            ),
                          }))
                        }
                        isDisabled={loading}
                      />
                    </div>
                    <Input
                      label="Value"
                      value={attribute.value}
                      onValueChange={(next) =>
                        updateAttribute(index, (current) => ({
                          ...current,
                          value: next,
                        }))
                      }
                      isDisabled={loading}
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
            isDisabled={loading}
          >
            Cancel
          </Button>
        ) : null}

        {onSubmitAndContinue ? (
          <Button
            variant="bordered"
            size="sm"
            type="button"
            onPress={handleSubmitAndContinue}
            isDisabled={loading}
          >
            {secondarySubmitLabel ?? "Save & add another"}
          </Button>
        ) : null}

        <Button color="primary" size="sm" type="submit" isLoading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
