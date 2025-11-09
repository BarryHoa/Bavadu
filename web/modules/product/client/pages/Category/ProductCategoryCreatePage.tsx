"use client";

import { Button } from "@heroui/button";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import ProductCategoryForm, {
  ProductCategoryFormValues,
} from "../../components/Category/ProductCategoryForm";
import type { ProductCategoryRow } from "../../interface/ProductCategory";

const ProductCategoryCreatePage = (): React.ReactNode => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation<
    ProductCategoryRow,
    Error,
    ProductCategoryFormValues
  >({
    mutationFn: async (values: ProductCategoryFormValues) => {
      const response = await fetch("/api/modules/product/category", {
        method: "POST",
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
      });

      const payload = await response.json();

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message ?? "Failed to create category");
      }

      return payload.data as ProductCategoryRow;
    },
  });

  const handleSubmit = async (values: ProductCategoryFormValues) => {
    setError(null);
    try {
      const created = await createMutation.mutateAsync(values);
      router.push(`/workspace/modules/product/category/view/${created.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create category"
      );
    }
  };

  const handleSubmitAndContinue = async (values: ProductCategoryFormValues) => {
    setError(null);
    try {
      await createMutation.mutateAsync(values);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create category"
      );
      throw err;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="light"
          startContent={<ArrowLeft size={14} />}
          onPress={() => router.push("/workspace/modules/product/category")}
        >
          Back
        </Button>
      </div>

      <ProductCategoryForm
        title="Create Category"
        subtitle="Define a new product category for organizing your catalog."
        submitLabel="Create"
        loading={createMutation.isPending}
        error={error}
        onSubmit={handleSubmit}
        onSubmitAndContinue={handleSubmitAndContinue}
        secondarySubmitLabel="Create & continute"
        onCancel={() => router.push("/workspace/modules/product/category")}
      />
    </div>
  );
};

export default ProductCategoryCreatePage;
