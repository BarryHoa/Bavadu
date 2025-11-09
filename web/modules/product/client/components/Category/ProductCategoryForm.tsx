"use client";

import Input from "@base/client/components/Input";
import { Button } from "@heroui/button";
import { Card, CardBody, Switch, Textarea } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import type { ProductCategoryRow } from "../../interface/ProductCategory";
import ProductCategoryService from "../../services/ProductCategoryService";

export type ProductCategoryFormValues = {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  level?: number | null;
  isActive: boolean;
};

interface ProductCategoryFormProps {
  title: string;
  subtitle?: string;
  submitLabel?: string;
  secondarySubmitLabel?: string;
  initialValues?: ProductCategoryFormValues;
  loading?: boolean;
  error?: string | null;
  onSubmit: (values: ProductCategoryFormValues) => Promise<void> | void;
  onSubmitAndContinue?: (
    values: ProductCategoryFormValues
  ) => Promise<void> | void;
  onCancel?: () => void;
  categoryId?: string;
}

const defaultValues: ProductCategoryFormValues = {
  name: "",
  code: "",
  description: "",
  parentId: "",
  level: null,
  isActive: true,
};

const MAX_LEVEL = 5;

const getDisplayName = (node: ProductCategoryRow) => {
  if (!node) return "";
  const { name, code, id } = node;

  if (typeof name === "string") return name;
  if (name && typeof name === "object") {
    const record = name as Record<string, string>;
    return record.en ?? record.vi ?? code ?? id ?? "";
  }

  return code ?? id ?? "";
};

const buildHierarchyOptions = (
  categories: ProductCategoryRow[],
  excludeId?: string
): { id: string; label: string; level: number }[] => {
  const grouped = new Map<string | null, ProductCategoryRow[]>();

  categories.forEach((category) => {
    if (excludeId && category.id === excludeId) {
      return;
    }

    const parentKey = category.parent?.id ?? null;
    const siblings = grouped.get(parentKey) ?? [];
    siblings.push(category);
    grouped.set(parentKey, siblings);
  });

  const results: { id: string; label: string; level: number }[] = [];

  const traverse = (parentKey: string | null, depth: number) => {
    const items = grouped.get(parentKey);
    if (!items) {
      return;
    }

    items.forEach((item) => {
      const prefix = depth > 1 ? `${"―".repeat(depth - 1)} ` : "";
      results.push({
        id: item.id,
        label: `${prefix}${getDisplayName(item)}`,
        level: depth,
      });
      traverse(item.id, depth + 1);
    });
  };

  traverse(null, 1);

  return results;
};

export default function ProductCategoryForm({
  title,
  subtitle,
  submitLabel = "Save",
  secondarySubmitLabel = "Save & add another",
  initialValues,
  loading = false,
  error,
  onSubmit,
  onSubmitAndContinue,
  onCancel,
  categoryId,
}: ProductCategoryFormProps) {
  const [values, setValues] = useState<ProductCategoryFormValues>(
    initialValues ?? defaultValues
  );

  const categoriesQuery = useQuery({
    queryKey: ["product-category-tree"],
    queryFn: () => ProductCategoryService.fetchTree(),
  });

  useEffect(() => {
    setValues(
      initialValues ? { ...defaultValues, ...initialValues } : defaultValues
    );
  }, [initialValues]);

  const categoryNodes = useMemo(() => {
    if (!categoriesQuery.data) return [];
    return buildHierarchyOptions(categoriesQuery.data, categoryId);
  }, [categoriesQuery.data, categoryId]);

  const computedLevel = useMemo(() => {
    if (!values.parentId) return 1;
    const parentNode = categoryNodes.find(
      (node) => node.id === values.parentId
    );
    return parentNode ? parentNode.level + 1 : 1;
  }, [values.parentId, categoryNodes]);

  const isLevelValid = computedLevel <= MAX_LEVEL;

  const buildPayload = (): ProductCategoryFormValues => ({
    ...values,
    name: values.name.trim(),
    code: values.code.trim(),
    description: values.description?.trim() || undefined,
    parentId: values.parentId?.trim() || undefined,
    level: computedLevel,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLevelValid) return;
    await onSubmit(buildPayload());
  };

  const handleSubmitAndContinue = async () => {
    if (!onSubmitAndContinue || !isLevelValid) return;
    await onSubmitAndContinue(buildPayload());
    setValues(defaultValues);
  };

  const levelValue = isLevelValid ? computedLevel : `>${MAX_LEVEL}`;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Card>
        <CardBody className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle ? (
              <p className="text-default-500 text-small">{subtitle}</p>
            ) : null}
          </div>

          <Input
            label="Name"
            placeholder="Electronics"
            value={values.name}
            onValueChange={(val) =>
              setValues((prev) => ({ ...prev, name: val }))
            }
            variant="bordered"
            isRequired
            isDisabled={loading}
          />

          <Input
            label="Code"
            placeholder="CAT-001"
            value={values.code}
            onValueChange={(val) =>
              setValues((prev) => ({ ...prev, code: val }))
            }
            variant="bordered"
            isRequired
            isDisabled={loading}
          />

          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase text-default-400">Parent</p>
            {categoriesQuery.isLoading ? (
              <p className="text-sm text-default-500">Loading categories...</p>
            ) : categoriesQuery.isError ? (
              <p className="text-sm text-danger-500">
                {categoriesQuery.error instanceof Error
                  ? categoriesQuery.error.message
                  : "Failed to load categories"}
              </p>
            ) : (
              <select
                className="rounded-medium border border-default-200 px-3 py-2 text-sm outline-none focus:border-primary"
                value={values.parentId ?? ""}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    parentId: event.target.value,
                  }))
                }
                disabled={loading}
              >
                <option value="">— Root (level 1) —</option>
                {categoryNodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.label}
                  </option>
                ))}
              </select>
            )}
            {!isLevelValid ? (
              <p className="text-xs text-danger-500">
                Maximum depth is {MAX_LEVEL}. Please choose a higher-level
                parent.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase text-default-400">Computed level</p>
            <p className="text-sm text-default-600">{levelValue}</p>
          </div>

          <Textarea
            label="Description"
            placeholder="Write a short description"
            value={values.description ?? ""}
            onValueChange={(val) =>
              setValues((prev) => ({ ...prev, description: val }))
            }
            variant="bordered"
            minRows={3}
            isDisabled={loading}
          />

          <Switch
            isSelected={values.isActive}
            onValueChange={(checked) =>
              setValues((prev) => ({ ...prev, isActive: checked }))
            }
            isDisabled={loading}
          >
            Active
          </Switch>

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
                isDisabled={loading || !isLevelValid}
              >
                {secondarySubmitLabel}
              </Button>
            ) : null}

            <Button
              color="primary"
              size="sm"
              endContent={<Save size={16} />}
              type="submit"
              isLoading={loading}
              isDisabled={!isLevelValid}
            >
              {submitLabel}
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}
