"use client";

import { Button } from "@heroui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import ProductCategoryForm, {
  ProductCategoryFormValues,
} from "../../components/Category/ProductCategoryForm";
import type { ProductCategoryRow } from "../../interface/ProductCategory";

const getParamValue = (
  value: string | string[] | undefined
): string | undefined => (Array.isArray(value) ? value[0] : value);

const ProductCategoryEditPage = (): React.ReactNode => {
  const params = useParams();
  const router = useRouter();
  const localized = useLocalizedText();
  const [error, setError] = useState<string | null>(null);

  const categoryId = useMemo(() => {
    const rawId = (params?.id ?? undefined) as string | string[] | undefined;

    return getParamValue(rawId);
  }, [params]);

  const categoryQuery = useQuery({
    queryKey: ["product-category-detail", categoryId],
    enabled: Boolean(categoryId),
    queryFn: async (): Promise<ProductCategoryRow> => {
      if (!categoryId) {
        throw new Error("Missing category id");
      }

      const response = await fetch(
        `/api/modules/product/categories/${categoryId}`,
        {
          cache: "no-store",
        }
      );
      const payload = await response.json();

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message ?? "Failed to load category");
      }

      return payload.data as ProductCategoryRow;
    },
  });

  const updateMutation = useMutation<
    ProductCategoryRow,
    Error,
    ProductCategoryFormValues
  >({
    mutationFn: async (values: ProductCategoryFormValues) => {
      if (!categoryId) {
        throw new Error("Missing category id");
      }

      const response = await fetch(
        `/api/modules/product/categories/${categoryId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: values.code,
            name: values.name,
            description: values.description,
            parentId: values.parentId,
            level: values.level,
            isActive: values.isActive,
          }),
        }
      );

      const payload = await response.json();

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message ?? "Failed to update category");
      }

      return payload.data as ProductCategoryRow;
    },
    onSuccess: (data) => {
      router.push(`/workspace/modules/product/categories/view/${data.id}`);
    },
  });

  const handleSubmit = async (values: ProductCategoryFormValues) => {
    setError(null);
    try {
      await updateMutation.mutateAsync(values);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update category"
      );
    }
  };

  const initialValues: ProductCategoryFormValues | undefined =
    categoryQuery.data
      ? {
          name: localized(categoryQuery.data.name) ?? "",
          code: categoryQuery.data.code ?? "",
          description: localized(categoryQuery.data.description) ?? "",
          parentId: categoryQuery.data.parent?.id ?? "",
          level: categoryQuery.data.level ?? null,
          isActive:
            categoryQuery.data.isActive === undefined
              ? true
              : Boolean(categoryQuery.data.isActive),
        }
      : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="light"
          startContent={<ArrowLeft size={14} />}
          onPress={() => router.back()}
        >
          Back
        </Button>
        {categoryId && (
          <span className="text-small text-default-500">
            Editing category #{categoryId}
          </span>
        )}
      </div>

      {categoryQuery.isLoading ? (
        <p className="text-default-500">Loading category...</p>
      ) : categoryQuery.isError ? (
        <div className="rounded-medium border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-500">
          {categoryQuery.error instanceof Error
            ? categoryQuery.error.message
            : "Failed to load category."}
        </div>
      ) : categoryQuery.data ? (
        <ProductCategoryForm
          title="Edit Category"
          subtitle="Update the metadata for this category."
          submitLabel="Save changes"
          initialValues={initialValues}
          loading={updateMutation.isPending}
          error={error}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
};

export default ProductCategoryEditPage;
