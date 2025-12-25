"use client";

import { IBaseButton } from "@base/client";
import { IBaseSpinner } from "@base/client";
import { addToast } from "@base/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { getClientLink } from "@base/client/utils/link/getClientLink";

import ProductForm from "../../components/Product/ProductForm";
import { ProductDetail, ProductFormValues } from "../../interface/Product";
import ProductService from "../../services/ProductService";
import {
  mapDetailToFormValues,
  mapFormValuesToPayload,
} from "../../utils/productMapper";

const getParamValue = (
  value: string | string[] | undefined,
): string | undefined => (Array.isArray(value) ? value[0] : value);

export default function ProductsEditPage(): React.ReactNode {
  const params = useParams();
  const router = useRouter();

  const productId = useMemo(() => {
    const rawId = (params?.id ?? undefined) as string | string[] | undefined;

    return getParamValue(rawId);
  }, [params]);

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

  const productQuery = useQuery({
    queryKey: ["product-detail", productId],
    enabled: Boolean(productId),
    queryFn: async () => {
      if (!productId) {
        throw new Error("Missing product id");
      }
      const response = await ProductService.getProductById(productId);

      if (!response.data) {
        throw new Error("Failed to load product");
      }

      return response.data as ProductDetail;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: ProductFormValues;
    }) => {
      const payload = mapFormValuesToPayload(values);
      const response = await ProductService.updateProduct(id, payload);

      if (!response.data) {
        throw new Error("Failed to update product");
      }

      return response.data;
    },
  });

  const navigateToList = useCallback(() => {
    router.push(listLink.as ?? listLink.path);
  }, [listLink.as, listLink.path, router]);

  const handleSubmit = async (values: ProductFormValues): Promise<void> => {
    if (!productId) return;

    try {
      await updateMutation.mutateAsync({ id: productId, values });
      addToast({
        title: "Product updated",
        description: "Changes saved successfully.",
        color: "success",
        variant: "solid",
        timeout: 4000,
      });

      const link = getViewLink(productId);

      setTimeout(() => {
        router.push(link.as ?? link.path);
      }, 500);
    } catch (error) {
      addToast({
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Failed to update product",
        color: "danger",
        variant: "solid",
        timeout: 5000,
      });
      throw error;
    }
  };

  if (!productId) {
    return (
      <div className="space-y-4">
        <IBaseButton size="sm" variant="light" onPress={navigateToList}>
          Back to products
        </IBaseButton>
        <p className="text-default-500">No product selected.</p>
      </div>
    );
  }

  if (productQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 text-default-500">
        <IBaseSpinner size="sm" />
        <span>Loading product...</span>
      </div>
    );
  }

  if (productQuery.isError) {
    return (
      <div className="space-y-4">
        <IBaseButton size="sm" variant="light" onPress={navigateToList}>
          Back to products
        </IBaseButton>
        <div className="rounded-medium border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-500">
          {productQuery.error instanceof Error
            ? productQuery.error.message
            : "Failed to load product."}
        </div>
      </div>
    );
  }

  const productDetail = productQuery.data;

  if (!productDetail) {
    return (
      <div className="space-y-4">
        <IBaseButton size="sm" variant="light" onPress={navigateToList}>
          Back to products
        </IBaseButton>
        <p className="text-default-500">Product not found.</p>
      </div>
    );
  }

  const initialFormValues = mapDetailToFormValues(productDetail);

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
        <span className="text-small text-default-500">
          Editing product #{productId}
        </span>
      </div>

      <ProductForm
        initialValues={initialFormValues}
        loading={updateMutation.isPending}
        submitLabel="Save changes"
        onCancel={() => {
          const viewLink = getViewLink(productId);

          router.push(viewLink.as ?? viewLink.path);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
