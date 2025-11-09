"use client";

import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { getClientLink } from "@/module-base/client/ultils/link/getClientLink";
import ProductCategoryForm, {
  ProductCategoryFormValues,
} from "../../components/Category/ProductCategoryForm";
import type { ProductCategoryRow } from "../../interface/ProductCategory";
import ProductCategoryService from "../../services/ProductCategoryService";

const ProductCategoryCreatePage = (): React.ReactNode => {
  const router = useRouter();

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

  const createMutation = useMutation<
    ProductCategoryRow,
    Error,
    ProductCategoryFormValues
  >({
    mutationFn: (values: ProductCategoryFormValues) =>
      ProductCategoryService.createCategory(values),
  });

  const handleSubmit = async (values: ProductCategoryFormValues) => {
    try {
      const created = await createMutation.mutateAsync(values);
      addToast({
        title: "Category created",
        description: "The category was created successfully.",
        color: "success",
        variant: "solid",
        timeout: 4000,
      });
      setTimeout(() => {
        const link = getCategoryViewLink(created.id);
        router.push(link.as ?? link.path);
      }, 500);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create category";
      addToast({
        title: "Create failed",
        description: message,
        color: "danger",
        variant: "solid",
        timeout: 5000,
      });
    }
  };

  const handleSubmitAndContinue = async (values: ProductCategoryFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      addToast({
        title: "Category created",
        description: "You can continue creating another category.",
        color: "success",
        variant: "solid",
        timeout: 4000,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create category";
      addToast({
        title: "Create failed",
        description: message,
        color: "danger",
        variant: "solid",
        timeout: 5000,
      });
      throw error;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="light"
          startContent={<ArrowLeft size={14} />}
          onPress={navigateToList}
          isDisabled={createMutation.isPending}
        >
          Back
        </Button>
      </div>

      <ProductCategoryForm
        title="Create Category"
        subtitle="Define a new product category for organizing your catalog."
        submitLabel="Create"
        loading={createMutation.isPending}
        onSubmit={handleSubmit}
        onSubmitAndContinue={handleSubmitAndContinue}
        secondarySubmitLabel="Create & add another"
        onCancel={navigateToList}
      />
    </div>
  );
};

export default ProductCategoryCreatePage;
