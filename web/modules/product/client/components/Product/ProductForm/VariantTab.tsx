"use client";

import type { LocaleFieldValue, VariantFieldValue } from "./types";

import {
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseTextarea,
  IBaseUploadImageTiny,
} from "@base/client/components";
import { IBaseButton } from "@base/client";
import { IBaseCard, IBaseCardBody, IBaseDivider } from "@base/client";
import { Plus, Trash } from "lucide-react";
import { useTranslations } from "next-intl";

import { ProductMasterFeaturesType } from "../../../interface/Product";

import { updateLocaleValue } from "./types";
import UomSection from "./UomSection";

type VariantTabProps = {
  value: VariantFieldValue;
  masterFeatures: Record<ProductMasterFeaturesType, boolean>;
  variantIndex: number;
  variantErrors?: {
    name?: { en?: { message?: string } };
    sku?: { message?: string };
    barcode?: { message?: string };
    manufacturerName?: { message?: string };
    manufacturerCode?: { message?: string };
    baseUom?: { message?: string };
    attributes?: Array<{
      code?: { message?: string };
      value?: { message?: string };
    }>;
  };
  isBusy: boolean;
  canRemove: boolean;
  onRemove: () => void;
  onUpdate: (
    updater: (current: VariantFieldValue) => VariantFieldValue,
  ) => void;
};

export default function VariantTab({
  value,
  masterFeatures,
  variantIndex,
  variantErrors,
  isBusy,
  canRemove,
  onRemove,
  onUpdate,
}: VariantTabProps) {
  const t = useTranslations("common");
  const tProductForm = useTranslations("mdl-product.product-create");

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {t("variant")} {variantIndex + 1}
        </h2>
        <IBaseButton
          isDisabled={isBusy || !canRemove}
          size="sm"
          startContent={<Trash size={14} />}
          variant="light"
          onPress={onRemove}
        >
          {tProductForm("removeVariant")}
        </IBaseButton>
      </div>

      <IBaseInputMultipleLang
        isRequired
        errorMessage={variantErrors?.name?.en?.message}
        isDisabled={isBusy}
        isInvalid={Boolean(variantErrors?.name?.en)}
        label={t("name")}
        value={value.name}
        onValueChange={(langs) =>
          onUpdate((current) => ({
            ...current,
            name: langs as unknown as LocaleFieldValue,
          }))
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <IBaseInput
          isRequired
          errorMessage={variantErrors?.sku?.message}
          isDisabled={isBusy}
          isInvalid={Boolean(variantErrors?.sku)}
          label={t("sku")}
          value={value.sku ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, sku: next }))
          }
        />
        <IBaseInput
          isRequired
          errorMessage={variantErrors?.barcode?.message}
          isDisabled={isBusy}
          isInvalid={Boolean(variantErrors?.barcode)}
          label={t("barcode")}
          value={value.barcode ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, barcode: next }))
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <IBaseInput
          errorMessage={variantErrors?.manufacturerName?.message}
          isDisabled={isBusy}
          isInvalid={Boolean(variantErrors?.manufacturerName)}
          label={tProductForm("manufacturerName")}
          value={value.manufacturerName ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, manufacturerName: next }))
          }
        />
        <IBaseInput
          errorMessage={variantErrors?.manufacturerCode?.message}
          isDisabled={isBusy}
          isInvalid={Boolean(variantErrors?.manufacturerCode)}
          label={tProductForm("manufacturerCode")}
          value={value.manufacturerCode ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, manufacturerCode: next }))
          }
        />
      </div>
      <IBaseDivider />
      <UomSection
        error={variantErrors?.baseUom}
        isBusy={isBusy}
        masterFeatures={masterFeatures}
        variantIndex={variantIndex}
      />

      <IBaseDivider />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-medium font-medium">
              {tProductForm("packings")}
            </h4>
            <p className="text-small text-default-500">
              {tProductForm("definePackaging")}
            </p>
          </div>
          <IBaseButton
            isDisabled={isBusy}
            size="sm"
            startContent={<Plus size={14} />}
            variant="bordered"
            onPress={() =>
              onUpdate((current) => ({
                ...current,
                packings: [
                  ...(current.packings || []),
                  {
                    name: { en: "", vi: "" },
                    description: "",
                    isActive: true,
                  },
                ],
              }))
            }
          >
            {tProductForm("addPacking")}
          </IBaseButton>
        </div>

        {!value.packings || value.packings.length === 0 ? (
          <p className="text-small text-default-500">
            {tProductForm("noPackingEntries")}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {value.packings.map((packing, packingIndex) => (
              <IBaseCard key={packingIndex} className="border border-default-200">
                <IBaseCardBody className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-small font-medium">
                      Packing #{packingIndex + 1}
                    </h5>
                    <IBaseButton
                      isDisabled={isBusy}
                      size="sm"
                      startContent={<Trash size={14} />}
                      variant="light"
                      onPress={() =>
                        onUpdate((current) => ({
                          ...current,
                          packings: current.packings.filter(
                            (_, idx) => idx !== packingIndex,
                          ),
                        }))
                      }
                    >
                      {t("actions.remove")}
                    </IBaseButton>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <IBaseInput
                      isDisabled={isBusy}
                      label={tProductForm("nameEnglish")}
                      value={packing.name.en ?? ""}
                      onValueChange={(next) =>
                        onUpdate((current) => ({
                          ...current,
                          packings: current.packings.map((p, idx) =>
                            idx === packingIndex
                              ? {
                                  ...p,
                                  name: updateLocaleValue(p.name, "en", next),
                                }
                              : p,
                          ),
                        }))
                      }
                    />
                    <IBaseInput
                      isDisabled={isBusy}
                      label={tProductForm("nameVietnamese")}
                      value={packing.name.vi ?? ""}
                      onValueChange={(next) =>
                        onUpdate((current) => ({
                          ...current,
                          packings: current.packings.map((p, idx) =>
                            idx === packingIndex
                              ? {
                                  ...p,
                                  name: updateLocaleValue(p.name, "vi", next),
                                }
                              : p,
                          ),
                        }))
                      }
                    />
                  </div>
                  <IBaseTextarea
                    isDisabled={isBusy}
                    label={t("description")}
                    value={packing.description ?? ""}
                    onValueChange={(next) =>
                      onUpdate((current) => ({
                        ...current,
                        packings: current.packings.map((p, idx) =>
                          idx === packingIndex
                            ? {
                                ...p,
                                description: next,
                              }
                            : p,
                        ),
                      }))
                    }
                  />
                </IBaseCardBody>
              </IBaseCard>
            ))}
          </div>
        )}
      </div>

      <IBaseDivider />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-medium font-medium">
              {tProductForm("attributes")}
            </h4>
            <p className="text-small text-default-500">
              {tProductForm("captureAttributes")}
            </p>
          </div>
          <IBaseButton
            isDisabled={isBusy}
            size="sm"
            startContent={<Plus size={14} />}
            variant="bordered"
            onPress={() =>
              onUpdate((current) => ({
                ...current,
                attributes: [
                  ...(current.attributes || []),
                  {
                    code: "",
                    name: { en: "", vi: "" },
                    value: "",
                  },
                ],
              }))
            }
          >
            {tProductForm("addAttribute")}
          </IBaseButton>
        </div>

        {!value.attributes || value.attributes.length === 0 ? (
          <p className="text-small text-default-500">
            {tProductForm("noAttributeEntries")}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {value.attributes.map((attribute, attributeIndex) => (
              <IBaseCard key={attributeIndex} className="border border-default-200">
                <IBaseCardBody className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-small font-medium">
                      Attribute #{attributeIndex + 1}
                    </h5>
                    <IBaseButton
                      isDisabled={isBusy}
                      size="sm"
                      startContent={<Trash size={14} />}
                      variant="light"
                      onPress={() =>
                        onUpdate((current) => ({
                          ...current,
                          attributes: current.attributes.filter(
                            (_, idx) => idx !== attributeIndex,
                          ),
                        }))
                      }
                    >
                      {t("actions.remove")}
                    </IBaseButton>
                  </div>
                  <IBaseInput
                    errorMessage={
                      variantErrors?.attributes?.[attributeIndex]?.code?.message
                    }
                    isDisabled={isBusy}
                    isInvalid={Boolean(
                      variantErrors?.attributes?.[attributeIndex]?.code,
                    )}
                    label={t("code")}
                    value={attribute.code}
                    onValueChange={(next) =>
                      onUpdate((current) => ({
                        ...current,
                        attributes: current.attributes.map((a, idx) =>
                          idx === attributeIndex ? { ...a, code: next } : a,
                        ),
                      }))
                    }
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <IBaseInput
                      isDisabled={isBusy}
                      label={tProductForm("nameEnglish")}
                      value={attribute.name.en ?? ""}
                      onValueChange={(next) =>
                        onUpdate((current) => ({
                          ...current,
                          attributes: current.attributes.map((a, idx) =>
                            idx === attributeIndex
                              ? {
                                  ...a,
                                  name: updateLocaleValue(a.name, "en", next),
                                }
                              : a,
                          ),
                        }))
                      }
                    />
                    <IBaseInput
                      isDisabled={isBusy}
                      label={tProductForm("nameVietnamese")}
                      value={attribute.name.vi ?? ""}
                      onValueChange={(next) =>
                        onUpdate((current) => ({
                          ...current,
                          attributes: current.attributes.map((a, idx) =>
                            idx === attributeIndex
                              ? {
                                  ...a,
                                  name: updateLocaleValue(a.name, "vi", next),
                                }
                              : a,
                          ),
                        }))
                      }
                    />
                  </div>
                  <IBaseInput
                    errorMessage={
                      variantErrors?.attributes?.[attributeIndex]?.value
                        ?.message
                    }
                    isDisabled={isBusy}
                    isInvalid={Boolean(
                      variantErrors?.attributes?.[attributeIndex]?.value,
                    )}
                    label={t("value")}
                    value={attribute.value}
                    onValueChange={(next) =>
                      onUpdate((current) => ({
                        ...current,
                        attributes: current.attributes.map((a, idx) =>
                          idx === attributeIndex ? { ...a, value: next } : a,
                        ),
                      }))
                    }
                  />
                </IBaseCardBody>
              </IBaseCard>
            ))}
          </div>
        )}
      </div>

      <IBaseTextarea
        isDisabled={isBusy}
        label={t("description")}
        value={value.description ?? ""}
        onValueChange={(next) =>
          onUpdate((current) => ({ ...current, description: next }))
        }
      />

      <IBaseUploadImageTiny
        isDisabled={isBusy}
        label={tProductForm("images")}
        maxCount={10}
        maxSize={5 * 1024 * 1024} // 5MB
        values={value.images ?? []}
        onChange={(images) => onUpdate((current) => ({ ...current, images }))}
      />
    </div>
  );
}
