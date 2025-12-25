"use client";

import { Button } from "@base/client";
import { addToast } from "@base/client";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { getClientLink } from "@base/client/utils/link/getClientLink";

import ProductForm from "../../components/Product/ProductForm";
import { ProductFormPayload, ProductFormValues } from "../../interface/Product";
import ProductService from "../../services/ProductService";
import { mapFormValuesToPayload } from "../../utils/productMapper";

const ProductsCreatePage = (): React.ReactNode => {
  const router = useRouter();

  const listLink = useMemo(
    () =>
      getClientLink({
        mdl: "product",
        path: "",
      }),
    [],
  );

  const getViewLink = useCallback((id: string) => {
    return getClientLink({
      mdl: "product",
      path: "view/[id]",
      as: `view/${id}`,
    });
  }, []);

  const navigateToList = useCallback(() => {
    router.push(listLink.as ?? listLink.path);
  }, [listLink.as, listLink.path, router]);

  const createMutation = useMutation({
    mutationFn: async (payload: ProductFormPayload) => {
      const response = await ProductService.createProduct(payload);

      if (!response.data) {
        throw new Error("Failed to create product");
      }

      return response.data;
    },
  });

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      const payload = mapFormValuesToPayload(values);
      const created = await createMutation.mutateAsync(payload);

      addToast({
        title: "Product created",
        description: "The product has been created successfully.",
        color: "success",
        variant: "solid",
        timeout: 4000,
      });

      if (created?.variant?.id) {
        const viewLink = getViewLink(created.variant.id);

        setTimeout(() => {
          router.push(viewLink.as ?? viewLink.path);
        }, 500);
      } else {
        navigateToList();
      }
    } catch (error) {
      addToast({
        title: "Create failed",
        description:
          error instanceof Error ? error.message : "Failed to create product",
        color: "danger",
        variant: "solid",
        timeout: 5000,
      });
    }
  };

  const handleSubmitAndContinue = async (values: ProductFormValues) => {
    try {
      const payload = mapFormValuesToPayload(values);

      await createMutation.mutateAsync(payload);
      addToast({
        title: "Product created",
        description: "You can add another product now.",
        color: "success",
        variant: "solid",
        timeout: 4000,
      });
    } catch (error) {
      addToast({
        title: "Create failed",
        description:
          error instanceof Error ? error.message : "Failed to create product",
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
          isDisabled={createMutation.isPending}
          size="sm"
          startContent={<ArrowLeft size={14} />}
          variant="light"
          onPress={navigateToList}
        >
          Back
        </Button>
      </div>

      <ProductForm
        loading={createMutation.isPending}
        secondarySubmitLabel="Create & add another"
        submitLabel="Create"
        onCancel={navigateToList}
        onSubmit={handleSubmit}
        onSubmitAndContinue={handleSubmitAndContinue}
      />
    </div>
  );
};

export default ProductsCreatePage;
