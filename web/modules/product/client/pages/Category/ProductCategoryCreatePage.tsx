"use client";

import { Button } from "@heroui/button";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getClientLink } from "@/module-base/client/ultils/link/getClientLink";
import ProductCategoryForm, {
  ProductCategoryFormValues,
} from "../../components/Category/ProductCategoryForm";
import type { ProductCategoryRow } from "../../interface/ProductCategory";
import ProductCategoryService from "../../services/ProductCategoryService";

type ToastState = {
  message: string;
  type: "success" | "error";
} | null;

const TOAST_DURATION = 3200;

const ProductCategoryCreatePage = (): React.ReactNode => {
  const router = useRouter();
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      setToast({ message, type });
      toastTimeoutRef.current = setTimeout(() => {
        setToast(null);
        toastTimeoutRef.current = null;
      }, TOAST_DURATION);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

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
      showToast("Category created successfully", "success");
      setTimeout(() => {
        const link = getCategoryViewLink(created.id);
        router.push(link.as ?? link.path);
      }, 500);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create category";
      showToast(message, "error");
    }
  };

  const handleSubmitAndContinue = async (values: ProductCategoryFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      showToast("Category created successfully", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create category";
      showToast(message, "error");
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

      {toast ? (
        <div className="fixed right-4 top-4 z-50 flex max-w-sm flex-col gap-2">
          <div
            className={clsx(
              "rounded-medium px-4 py-3 text-sm shadow-large",
              toast.type === "error"
                ? "bg-danger-100 text-danger"
                : "bg-success-100 text-success"
            )}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductCategoryCreatePage;
