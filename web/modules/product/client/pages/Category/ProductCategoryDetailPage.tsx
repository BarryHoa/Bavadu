"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, Divider } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

const getParamValue = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const ProductCategoryDetailPage = (): React.ReactNode => {
  const params = useParams();
  const router = useRouter();

  const categoryId = useMemo(() => {
    const rawId = (params?.id ?? undefined) as string | string[] | undefined;

    return getParamValue(rawId);
  }, [params]);

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
          <div>
            <h1 className="text-xl font-semibold">Category Detail</h1>
            {categoryId && (
              <p className="text-small text-default-500">Category ID: {categoryId}</p>
            )}
          </div>

          <Divider />

          <p className="text-default-500">
            Provide an overview of the selected category here. You can surface parent
            relationships, assigned products, and metadata once the API integration is
            ready.
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProductCategoryDetailPage;

