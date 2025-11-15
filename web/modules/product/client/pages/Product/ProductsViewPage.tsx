"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, Chip, Divider } from "@heroui/react";
import { Spinner } from "@heroui/spinner";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import LinkAs from "@base/client/components/LinkAs";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

import type { ProductDetail } from "../../interface/Product";
import ProductService from "../../services/ProductService";
import { getClientLink } from "@/module-base/client/utils/link/getClientLink";

const getParamValue = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export default function ProductsViewPage(): React.ReactNode {
  const params = useParams();
  const router = useRouter();
  const localized = useLocalizedText();

  const productId = useMemo(() => {
    const rawId = (params?.id ?? undefined) as string | string[] | undefined;

    return getParamValue(rawId);
  }, [params]);

  const editLink = useMemo(() => {
    if (!productId) {
      return null;
    }

    return getClientLink({
      mdl: "product",
      path: "edit/[id]",
      as: `edit/${productId}`,
    });
  }, [productId]);

  const productQuery = useQuery({
    queryKey: ["product-detail", productId],
    enabled: Boolean(productId),
    queryFn: async () => {
      if (!productId) {
        throw new Error("Missing product id");
      }
      const response = await ProductService.getProductById(productId);
      if (!response.success) {
        throw new Error("Failed to load product");
      }
      return response.data as ProductDetail;
    },
  });

  if (!productId) {
    return (
      <div className="space-y-4">
        <Button size="sm" variant="light" onPress={() => router.back()}>
          Back
        </Button>
        <p className="text-default-500">No product selected.</p>
      </div>
    );
  }

  const renderLoading = (
    <div className="flex items-center gap-2 text-default-500">
      <Spinner size="sm" />
      <span>Loading product...</span>
    </div>
  );

  const renderError = (
    <div className="rounded-medium border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-500">
      {productQuery.error instanceof Error
        ? productQuery.error.message
        : "Failed to load product."}
    </div>
  );

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
        {editLink ? (
          <Button
            size="sm"
            color="primary"
            className="ml-2"
            as={LinkAs as any}
            href={editLink.path}
          >
            Edit product
          </Button>
        ) : null}
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Chip variant="flat" size="sm">
              Product ID: {productId}
            </Chip>
          </div>

          {productQuery.isLoading ? (
            renderLoading
          ) : productQuery.isError ? (
            renderError
          ) : productQuery.data ? (
            <ProductDetailContent detail={productQuery.data} />
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}

const ProductDetailContent = ({ detail }: { detail: ProductDetail }) => {
  const localized = useLocalizedText();

  const features = Object.entries(detail.master.features ?? {}).filter(
    ([, value]) => Boolean(value)
  );

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Master information</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <InfoRow label="Code" value={detail.master.code} />
          <InfoRow
            label="Name"
            value={localized(detail.master.name) ?? detail.master.code}
          />
          <InfoRow
            label="Type"
            value={detail.master.type?.replace(/_/g, " ") ?? "-"}
          />
          <InfoRow
            label="Brand"
            value={localized(detail.master.brand) ?? "-"}
          />
          <InfoRow
            label="Category"
            value={
              detail.master.category
                ? localized(detail.master.category.name) ?? detail.master.category.code ?? detail.master.category.id
                : "-"
            }
          />
        </div>
        <InfoRow
          label="Description"
          value={localized(detail.master.description) ?? "-"}
        />
        <div className="flex flex-wrap gap-2">
          <span className="text-xs uppercase text-default-400">Features</span>
          <div className="flex flex-wrap gap-2">
            {features.length === 0 ? (
              <span className="text-small text-default-500">None</span>
            ) : (
              features.map(([key]) => (
                <Chip key={key} size="sm" variant="flat">
                  {key}
                </Chip>
              ))
            )}
          </div>
        </div>
      </section>

      <Divider />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Variant</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <InfoRow
            label="Name"
            value={localized(detail.variant.name) ?? detail.master.code}
          />
          <InfoRow label="SKU" value={detail.variant.sku ?? "-"} />
          <InfoRow label="Barcode" value={detail.variant.barcode ?? "-"} />
          <InfoRow
            label="Manufacturer"
            value={
              detail.variant.manufacturer
                ? localized(detail.variant.manufacturer.name) ??
                  detail.variant.manufacturer.code ??
                  "-"
                : "-"
            }
          />
          <InfoRow
            label="Base UOM"
            value={
              detail.variant.baseUom
                ? localized(detail.variant.baseUom.name) ??
                  detail.variant.baseUom.id
                : "-"
            }
          />
        </div>
        <InfoRow
          label="Description"
          value={localized(detail.variant.description) ?? "-"}
        />
      </section>

      <Divider />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Packings</h2>
        {detail.packings.length === 0 ? (
          <p className="text-small text-default-500">No packings defined.</p>
        ) : (
          <div className="space-y-3">
            {detail.packings.map((packing) => (
              <Card key={packing.id ?? localized(packing.name) ?? Math.random()}>
                <CardBody className="space-y-2">
                  <span className="font-medium">
                    {localized(packing.name) ?? packing.id}
                  </span>
                  <p className="text-small text-default-500">
                    {localized(packing.description) ?? "-"}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Divider />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Attributes</h2>
        {detail.attributes.length === 0 ? (
          <p className="text-small text-default-500">No attributes defined.</p>
        ) : (
          <div className="space-y-3">
            {detail.attributes.map((attribute) => (
              <Card key={attribute.id ?? attribute.code}>
                <CardBody className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{attribute.code}</span>
                  </div>
                  <p className="text-small text-default-500">
                    {localized(attribute.name) ?? attribute.code}
                  </p>
                  <p className="text-small text-default-600">{attribute.value}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="text-xs uppercase text-default-400">{label}</p>
    <p className="text-sm text-default-600">{value && value !== "" ? value : "-"}</p>
  </div>
);

