"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, Divider } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

const getParamValue = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export default function ProductsViewPage(): React.ReactNode {
  const params = useParams();
  const router = useRouter();

  const productId = useMemo(() => {
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
          Back to products
        </Button>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">Product Detail</h1>
            {productId && (
              <p className="text-small text-default-500">Product ID: {productId}</p>
            )}
          </div>

          <Divider />

          <p className="text-default-500">
            This page is ready to display detailed product information. Integrate it
            with your product detail API to render specifications, pricing, stock, and
            related metadata.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

