"use client";

import type { ProductCategoryRow } from "../../interface/ProductCategory";

import { IBaseButton } from "@base/client";
import { addToast } from "@base/client";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { getClientLink } from "@base/client/utils/link/getClientLink";

import ProductCategoryForm, {
  ProductCategoryFormValues,
} from "../../components/Category/ProductCategoryForm";
import ProductCategoryService from "../../services/ProductCategoryService";

const ProductCategoryCreatePage = (): React.ReactNode => {
  const router = useRouter();

  // React Compiler will automatically optimize these computations
  const listLink = getClientLink({
    mdl: "product",
    path: "category",
  });

  const getCategoryViewLink = (id: string) =>
    getClientLink({
      mdl: "product",
      path: "category/view/[id]",
      as: `category/view/${id}`,
    });

  const navigateToList = () => {
    router.push(listLink.as ?? listLink.path);
  };

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
        <IBaseButton
          isDisabled={createMutation.isPending}
          size="sm"
          startContent={<ArrowLeft size={14} />}
          variant="light"
          onPress={navigateToList}
        >
          Back
        </IBaseButton>
      </div>

      <ProductCategoryForm
        loading={createMutation.isPending}
        secondarySubmitLabel="Create & add another"
        submitLabel="Create"
        subtitle="Define a new product category for organizing your catalog."
        title="Create Category"
        onCancel={navigateToList}
        onSubmit={handleSubmit}
        onSubmitAndContinue={handleSubmitAndContinue}
      />
    </div>
  );
};

export default ProductCategoryCreatePage;
