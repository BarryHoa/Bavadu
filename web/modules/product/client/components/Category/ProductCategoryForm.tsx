"use client";

import Input from "@base/client/components/Input";
import { Button } from "@heroui/button";
import { Card, CardBody, Switch, Textarea } from "@heroui/react";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useQuery } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useEffect, useMemo } from "react";
import type { Resolver, SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import {
  boolean,
  minLength,
  number,
  object,
  optional,
  pipe,
  string,
  trim,
} from "valibot";

import type { ProductCategoryRow } from "../../interface/ProductCategory";
import ProductCategoryService from "../../services/ProductCategoryService";

export type ProductCategoryFormValues = {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  level?: number;
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
  level: 1,
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

const productCategorySchema = object({
  name: pipe(string(), trim(), minLength(1, "Name is required")),
  code: pipe(string(), trim(), minLength(1, "Code is required")),
  description: optional(pipe(string(), trim())),
  parentId: optional(pipe(string(), trim())),
  level: optional(number()),
  isActive: boolean(),
});

const normalizeValues = (
  values?: ProductCategoryFormValues
): ProductCategoryFormValues => ({
  ...defaultValues,
  ...values,
  level: values?.level ?? defaultValues.level,
});

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
  const categoriesQuery = useQuery({
    queryKey: ["product-category-tree"],
    queryFn: () => ProductCategoryService.fetchTree(),
  });

  const normalizedDefaults = normalizeValues(initialValues);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ProductCategoryFormValues>({
    defaultValues: normalizedDefaults,
    resolver: valibotResolver(
      productCategorySchema
    ) as Resolver<ProductCategoryFormValues>,
  });

  useEffect(() => {
    reset(normalizeValues(initialValues));
  }, [initialValues, reset]);

  const categoryNodes = useMemo(() => {
    if (!categoriesQuery.data) return [];
    return buildHierarchyOptions(categoriesQuery.data, categoryId);
  }, [categoriesQuery.data, categoryId]);

  const parentId = watch("parentId");
  const computedLevel = useMemo(() => {
    if (!parentId) return 1;
    const parentNode = categoryNodes.find((node) => node.id === parentId);
    return parentNode ? parentNode.level + 1 : 1;
  }, [parentId, categoryNodes]);

  const isLevelValid = computedLevel <= MAX_LEVEL;

  useEffect(() => {
    setValue("level", computedLevel, { shouldDirty: true });
    if (isLevelValid) {
      clearErrors("parentId");
    } else {
      setError("parentId", {
        type: "validate",
        message: `Maximum depth is ${MAX_LEVEL}. Please choose a higher-level parent.`,
      });
    }
  }, [computedLevel, isLevelValid, setValue, setError, clearErrors]);

  const levelValue = isLevelValid ? computedLevel : `>${MAX_LEVEL}`;

  const handleValidSubmit: SubmitHandler<ProductCategoryFormValues> = async (
    formValues
  ) => {
    if (!isLevelValid) {
      return;
    }

    const payload: ProductCategoryFormValues = {
      ...formValues,
      name: formValues.name.trim(),
      code: formValues.code.trim(),
      description: formValues.description?.trim() || undefined,
      parentId: formValues.parentId?.trim() || undefined,
      level: computedLevel,
    };

    await onSubmit(payload);
  };

  const handleValidSubmitAndContinue: SubmitHandler<
    ProductCategoryFormValues
  > = async (formValues) => {
    if (!onSubmitAndContinue || !isLevelValid) {
      return;
    }

    const payload: ProductCategoryFormValues = {
      ...formValues,
      name: formValues.name.trim(),
      code: formValues.code.trim(),
      description: formValues.description?.trim() || undefined,
      parentId: formValues.parentId?.trim() || undefined,
      level: computedLevel,
    };

    await onSubmitAndContinue(payload);
    reset(defaultValues);
  };

  const onSubmitForm = handleSubmit(handleValidSubmit);

  const onSubmitAndContinueForm = onSubmitAndContinue
    ? handleSubmit(handleValidSubmitAndContinue)
    : undefined;

  const isBusy = loading || isSubmitting;

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmitForm}>
      <Card>
        <CardBody className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle ? (
              <p className="text-default-500 text-small">{subtitle}</p>
            ) : null}
            {error ? (
              <p className="text-small text-danger-500">{error}</p>
            ) : null}
          </div>

          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                {...field}
                label="Name"
                placeholder="Electronics"
                value={field.value}
                onValueChange={field.onChange}
                variant="bordered"
                isRequired
                isInvalid={Boolean(errors.name)}
                errorMessage={errors.name?.message}
                isDisabled={isBusy}
              />
            )}
          />

          <Controller
            control={control}
            name="code"
            render={({ field }) => (
              <Input
                {...field}
                label="Code"
                placeholder="CAT-001"
                value={field.value}
                onValueChange={field.onChange}
                variant="bordered"
                isRequired
                isInvalid={Boolean(errors.code)}
                errorMessage={errors.code?.message}
                isDisabled={isBusy}
              />
            )}
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
              <Controller
                control={control}
                name="parentId"
                render={({ field }) => (
                  <select
                    className="rounded-medium border border-default-200 px-3 py-2 text-sm outline-none focus:border-primary"
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(event.target.value || undefined)
                    }
                    disabled={isBusy}
                  >
                    <option value="">— Root (level 1) —</option>
                    {categoryNodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            )}
            {errors.parentId ? (
              <p className="text-xs text-danger-500">
                {errors.parentId.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase text-default-400">Computed level</p>
            <p className="text-sm text-default-600">{levelValue}</p>
          </div>

          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <Textarea
                {...field}
                label="Description"
                placeholder="Write a short description"
                value={field.value ?? ""}
                onValueChange={field.onChange}
                variant="bordered"
                minRows={3}
                isDisabled={isBusy}
              />
            )}
          />

          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <Switch
                isSelected={field.value}
                onValueChange={field.onChange}
                isDisabled={isBusy}
              >
                Active
              </Switch>
            )}
          />

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
                  onSubmitAndContinueForm
                    ? async () => {
                        await onSubmitAndContinueForm();
                      }
                    : undefined
                }
                isDisabled={isBusy || !isLevelValid}
              >
                {secondarySubmitLabel}
              </Button>
            ) : null}

            <Button
              color="primary"
              size="sm"
              endContent={<Save size={16} />}
              type="submit"
              isLoading={isBusy}
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
