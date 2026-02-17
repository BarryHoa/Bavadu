"use client";

import type { LocalizeText } from "@base/client/interface/LocalizeText";
import type { ProductDetail } from "../../interface/Product";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useTranslations } from "next-intl";

import { IBaseSpinner } from "@base/client";
import { IBaseCard, IBaseCardBody, IBaseChip, IBaseDivider } from "@base/client";
import { IBaseButton } from "@base/client";
import { IBaseLink } from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { getClientLink } from "@base/client/utils/link/getClientLink";

import ProductService from "../../services/ProductService";

const getParamValue = (
  value: string | string[] | undefined,
): string | undefined => (Array.isArray(value) ? value[0] : value);

export default function ProductsViewPage(): React.ReactNode {
  const params = useParams();
  const router = useRouter();
  const localized = useLocalizedText();
  const t = useTranslations("mdl-product.product-view");

  // React Compiler will automatically optimize these computations
  const rawId = (params?.id ?? undefined) as string | string[] | undefined;
  const productId = getParamValue(rawId);

  const editLink = !productId
    ? null
    : getClientLink({
        mdl: "product",
        path: "edit/[id]",
        as: `edit/${productId}`,
      });

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

  if (!productId) {
    return (
      <div className="space-y-4">
        <IBaseButton size="sm" variant="light" onPress={() => router.back()}>
          Back
        </IBaseButton>
        <p className="text-default-500">No product selected.</p>
      </div>
    );
  }

  const renderLoading = (
    <div className="flex items-center gap-2 text-default-500">
      <IBaseSpinner size="sm" />
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
        <IBaseButton
          size="sm"
          startContent={<ArrowLeft size={14} />}
          variant="light"
          onPress={() => router.back()}
        >
          Back to products
        </IBaseButton>
        {editLink ? (
          <IBaseButton
            as={IBaseLink as any}
            className="ml-2"
            color="primary"
            href={editLink.path}
            size="sm"
          >
            Edit product
          </IBaseButton>
        ) : null}
      </div>

      <IBaseCard>
        <IBaseCardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <IBaseChip size="sm" variant="flat">
              Product ID: {productId}
            </IBaseChip>
          </div>

          {productQuery.isLoading ? (
            renderLoading
          ) : productQuery.isError ? (
            renderError
          ) : productQuery.data ? (
            <ProductDetailContent detail={productQuery.data} />
          ) : null}
        </IBaseCardBody>
      </IBaseCard>
    </div>
  );
}

const ProductDetailContent = ({ detail }: { detail: ProductDetail }) => {
  const localized = useLocalizedText();
  const t = useTranslations("mdl-product.product-view");

  const features = Object.entries(detail.master.features ?? {}).filter(
    ([, value]) => Boolean(value),
  );

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("masterInformation")}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <InfoRow label={t("fields.code")} value={detail.master.code} />
          <InfoRow
            label={t("fields.name")}
            value={
              localized(detail.master.name as LocalizeText) ??
              detail.master.code
            }
          />
          <InfoRow
            label={t("fields.type")}
            value={detail.master.type?.replace(/_/g, " ") ?? "-"}
          />
          <InfoRow
            label={t("fields.brand")}
            value={
              typeof detail.master.brand === "string"
                ? detail.master.brand
                : "-"
            }
          />
          <InfoRow
            label={t("fields.category")}
            value={
              detail.master.category
                ? (localized(detail.master.category.name as LocalizeText) ??
                  detail.master.category.code ??
                  detail.master.category.id)
                : "-"
            }
          />
        </div>
        <InfoRow label={t("fields.description")} value={detail.master.description || "-"} />
        <div className="flex flex-wrap gap-2">
          <span className="text-xs uppercase text-default-400">{t("features")}</span>
          <div className="flex flex-wrap gap-2">
            {features.length === 0 ? (
              <span className="text-small text-default-500">{t("none")}</span>
            ) : (
              features.map(([key]) => (
                <IBaseChip key={key} size="sm" variant="flat">
                  {key}
                </IBaseChip>
              ))
            )}
          </div>
        </div>
      </section>

      <IBaseDivider />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("variant")}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <InfoRow
            label={t("fields.name")}
            value={
              localized(detail.variant.name as LocalizeText) ??
              detail.master.code
            }
          />
          <InfoRow label={t("fields.sku")} value={detail.variant.sku ?? "-"} />
          <InfoRow label={t("fields.barcode")} value={detail.variant.barcode ?? "-"} />
          <InfoRow
            label={t("fields.manufacturer")}
            value={
              detail.variant.manufacturer
                ? ((typeof detail.variant.manufacturer.name === "string"
                    ? detail.variant.manufacturer.name
                    : detail.variant.manufacturer.code) ?? "-")
                : "-"
            }
          />
          <InfoRow
            label={t("fields.baseUom")}
            value={
              detail.variant.baseUom
                ? (localized(detail.variant.baseUom.name as LocalizeText) ??
                  detail.variant.baseUom.id)
                : "-"
            }
          />
        </div>
        <InfoRow
          label={t("fields.description")}
          value={detail.variant.description || "-"}
        />
      </section>

      <IBaseDivider />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("packings")}</h2>
        {detail.packings.length === 0 ? (
          <p className="text-small text-default-500">No packings defined.</p>
        ) : (
          <div className="space-y-3">
            {detail.packings.map((packing) => (
              <IBaseCard
                key={
                  packing.id ??
                  localized(packing.name as LocalizeText) ??
                  Math.random()
                }
              >
                <IBaseCardBody className="space-y-2">
                  <span className="font-medium">
                    {localized(packing.name as LocalizeText) ?? packing.id}
                  </span>
                  <p className="text-small text-default-500">
                    {localized(packing.description as LocalizeText) ?? "-"}
                  </p>
                </IBaseCardBody>
              </IBaseCard>
            ))}
          </div>
        )}
      </section>

      <IBaseDivider />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("attributes")}</h2>
        {detail.attributes.length === 0 ? (
          <p className="text-small text-default-500">No attributes defined.</p>
        ) : (
          <div className="space-y-3">
            {detail.attributes.map((attribute) => (
              <IBaseCard key={attribute.id ?? attribute.code}>
                <IBaseCardBody className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{attribute.code}</span>
                  </div>
                  <p className="text-small text-default-500">
                    {localized(attribute.name as LocalizeText) ??
                      attribute.code}
                  </p>
                  <p className="text-small text-default-600">
                    {attribute.value}
                  </p>
                </IBaseCardBody>
              </IBaseCard>
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
    <p className="text-sm text-default-600">
      {value && value !== "" ? value : "-"}
    </p>
  </div>
);
