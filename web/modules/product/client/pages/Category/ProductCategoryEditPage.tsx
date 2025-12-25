"use client";

import type { LocalizeText } from "@base/client/interface/LocalizeText";
import type { ProductCategoryRow } from "../../interface/ProductCategory";

import { IBaseButton } from "@base/client";
import { addToast } from "@base/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { getClientLink } from "@base/client/utils/link/getClientLink";

import ProductCategoryForm, {
  ProductCategoryFormValues,
} from "../../components/Category/ProductCategoryForm";
import ProductCategoryService from "../../services/ProductCategoryService";

const getParamValue = (
  value: string | string[] | undefined,
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
    [],
  );

  const getCategoryViewLink = useCallback(
    (id: string) =>
      getClientLink({
        mdl: "product",
        path: "category/view/[id]",
        as: `category/view/${id}`,
      }),
    [],
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
          name: localized(categoryQuery.data.name as LocalizeText) ?? "",
          code: categoryQuery.data.code ?? "",
          description:
            localized(categoryQuery.data.description as LocalizeText) ?? "",
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
        <IBaseButton
          isDisabled={updateMutation.isPending}
          size="sm"
          startContent={<ArrowLeft size={14} />}
          variant="light"
          onPress={() => router.back()}
        >
          Back
        </IBaseButton>
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
          categoryId={categoryId}
          initialValues={initialValues}
          loading={updateMutation.isPending}
          submitLabel="Save changes"
          subtitle="Update the metadata for this category."
          title="Edit Category"
          onCancel={() => {
            if (categoryId) {
              const link = getCategoryViewLink(categoryId);

              router.push(link.as ?? link.path);
            } else {
              navigateToList();
            }
          }}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
};

export default ProductCategoryEditPage;
