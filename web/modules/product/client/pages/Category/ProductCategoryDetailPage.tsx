"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, Divider } from "@heroui/react";
import { Spinner } from "@heroui/spinner";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { formatDate } from "@base/client/utils/date/formatDate";
import ProductCategoryService from "../../services/ProductCategoryService";
import type { ProductCategoryRow } from "../../interface/ProductCategory";

const getParamValue = (
  value: string | string[] | undefined
): string | undefined => (Array.isArray(value) ? value[0] : value);

const ProductCategoryDetailPage = (): React.ReactNode => {
  const params = useParams();
  const router = useRouter();
  const localized = useLocalizedText();

  const categoryId = useMemo(() => {
    const rawId = (params?.id ?? undefined) as string | string[] | undefined;

    return getParamValue(rawId);
  }, [params]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["product-category-detail", categoryId],
    enabled: Boolean(categoryId),
    queryFn: async (): Promise<ProductCategoryRow> => {
      if (!categoryId) {
        throw new Error("Missing category id");
      }

      return ProductCategoryService.getById(categoryId);
    },
  });

  const category = data;

  const infoRows = [
    {
      label: "Name",
      value: category ? (localized(category.name) ?? category.code) : "-",
    },
    {
      label: "Code",
      value: category?.code ?? "-",
    },
    {
      label: "Parent",
      value:
        category?.parent && category.parent.name
          ? (localized(category.parent.name) ?? category.parent.id)
          : (category?.parent?.id ?? "-"),
    },
    {
      label: "Level",
      value: category?.level ?? "-",
    },
    {
      label: "Updated At",
      value: category?.updatedAt ? formatDate(category.updatedAt) : "-",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button
          size="sm"
          variant="light"
          startContent={<ArrowLeft size={14} />}
          onPress={() => router.back()}
        >
          Back to categories
        </Button>
      </div>

      <Card>
        <CardBody className="space-y-4">
          {!categoryId ? (
            <p className="text-default-500">No category selected.</p>
          ) : isLoading ? (
            <div className="flex items-center gap-2 text-default-500">
              <Spinner size="sm" />
              <span>Loading category details...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col gap-2 text-danger">
              <p>
                {error instanceof Error
                  ? error.message
                  : "Failed to load category."}
              </p>
              <Button size="sm" variant="bordered" onPress={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {infoRows.map((row) => (
                  <div key={row.label}>
                    <p className="text-xs uppercase text-default-400">
                      {row.label}
                    </p>
                    <div className="mt-1 text-sm text-default-600">
                      {row.value}
                    </div>
                  </div>
                ))}
              </div>

              {category?.description ? (
                <>
                  <Divider />
                  <div>
                    <p className="text-xs uppercase text-default-400">
                      Description
                    </p>
                    <p className="mt-1 text-sm text-default-600">
                      {localized(category.description) ?? "-"}
                    </p>
                  </div>
                </>
              ) : null}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ProductCategoryDetailPage;
