"use client";

import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { getClientLink } from "@/module-base/client/utils/link/getClientLink";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import ProductCategoryForm, {
  ProductCategoryFormValues,
} from "../../components/Category/ProductCategoryForm";
import type { ProductCategoryRow } from "../../interface/ProductCategory";
import ProductCategoryService from "../../services/ProductCategoryService";

const getParamValue = (
  value: string | string[] | undefined
): string | undefined => (Array.isArray(value) ? value[0] : value);

const ProductCategoryEditPage = (): React.ReactNode => {
  const params = useParams();
  const router = useRouter();
  const localized = useLocalizedText();

  const listLink = useMemo(
    () =>
      getClientLink({
        mdl: "product",
        path: "category",
      }),
    []
  );

  const getCategoryViewLink = useCallback(
    (id: string) =>
      getClientLink({
        mdl: "product",
        path: "category/view/[id]",
        as: `category/view/${id}`,
      }),
    []
  );

  const navigateToList = useCallback(() => {
    router.push(listLink.as ?? listLink.path);
  }, [listLink.as, listLink.path, router]);

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
      return ProductCategoryService.getById(categoryId);
    },
  });

  const updateMutation = useMutation<
    ProductCategoryRow,
    Error,
    ProductCategoryFormValues
  >({
    mutationFn: (values: ProductCategoryFormValues) => {
      if (!categoryId) {
        throw new Error("Missing category id");
      }
      return ProductCategoryService.updateCategory(categoryId, values);
    },
  });

  const handleSubmit = async (values: ProductCategoryFormValues) => {
    try {
      const updated = await updateMutation.mutateAsync(values);
      addToast({
        title: "Category updated",
        description: "Changes saved successfully.",
        color: "success",
        variant: "solid",
        timeout: 4000,
      });
      setTimeout(() => {
        const link = getCategoryViewLink(updated.id);
        router.push(link.as ?? link.path);
      }, 500);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update category";
      addToast({
        title: "Update failed",
        description: message,
        color: "danger",
        variant: "solid",
        timeout: 5000,
      });
    }
  };

  const initialValues: ProductCategoryFormValues | undefined =
    categoryQuery.data
      ? {
          name: localized(categoryQuery.data.name) ?? "",
          code: categoryQuery.data.code ?? "",
          description: localized(categoryQuery.data.description) ?? "",
          parentId: categoryQuery.data.parent?.id ?? "",
          level: categoryQuery.data.level ?? undefined,
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
          isDisabled={updateMutation.isPending}
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
          onSubmit={handleSubmit}
          onCancel={() => {
            if (categoryId) {
              const link = getCategoryViewLink(categoryId);
              router.push(link.as ?? link.path);
            } else {
              navigateToList();
            }
          }}
          categoryId={categoryId}
        />
      ) : null}
    </div>
  );
};

export default ProductCategoryEditPage;
