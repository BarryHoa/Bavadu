"use client";

import {
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseTextarea,
} from "@base/client/components";
import { Button } from "@heroui/button";
import { Card, CardBody, Divider } from "@heroui/react";
import { Plus, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProductMasterFeaturesType } from "../../../interface/Product";
import type { LocaleFieldValue, VariantFieldValue } from "./types";
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
    updater: (current: VariantFieldValue) => VariantFieldValue
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
        <Button
          size="sm"
          variant="light"
          startContent={<Trash size={14} />}
          onPress={onRemove}
          isDisabled={isBusy || !canRemove}
        >
          {tProductForm("removeVariant")}
        </Button>
      </div>

      <IBaseInputMultipleLang
        label={t("name")}
        value={value.name}
        onValueChange={(langs) =>
          onUpdate((current) => ({
            ...current,
            name: langs as unknown as LocaleFieldValue,
          }))
        }
        isRequired
        isInvalid={Boolean(variantErrors?.name?.en)}
        errorMessage={variantErrors?.name?.en?.message}
        isDisabled={isBusy}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <IBaseInput
          label={t("sku")}
          value={value.sku ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, sku: next }))
          }
          isRequired
          isInvalid={Boolean(variantErrors?.sku)}
          errorMessage={variantErrors?.sku?.message}
          isDisabled={isBusy}
        />
        <IBaseInput
          label={t("barcode")}
          value={value.barcode ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, barcode: next }))
          }
          isRequired
          isInvalid={Boolean(variantErrors?.barcode)}
          errorMessage={variantErrors?.barcode?.message}
          isDisabled={isBusy}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <IBaseInput
          label={tProductForm("manufacturerName")}
          value={value.manufacturerName ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, manufacturerName: next }))
          }
          isInvalid={Boolean(variantErrors?.manufacturerName)}
          errorMessage={variantErrors?.manufacturerName?.message}
          isDisabled={isBusy}
        />
        <IBaseInput
          label={tProductForm("manufacturerCode")}
          value={value.manufacturerCode ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, manufacturerCode: next }))
          }
          isInvalid={Boolean(variantErrors?.manufacturerCode)}
          errorMessage={variantErrors?.manufacturerCode?.message}
          isDisabled={isBusy}
        />
      </div>
      <Divider />
      <UomSection
        variantIndex={variantIndex}
        masterFeatures={masterFeatures}
        isBusy={isBusy}
        error={variantErrors?.baseUom}
      />

      <Divider />

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
          <Button
            size="sm"
            variant="bordered"
            startContent={<Plus size={14} />}
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
            isDisabled={isBusy}
          >
            {tProductForm("addPacking")}
          </Button>
        </div>

        {!value.packings || value.packings.length === 0 ? (
          <p className="text-small text-default-500">
            {tProductForm("noPackingEntries")}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {value.packings.map((packing, packingIndex) => (
              <Card key={packingIndex} className="border border-default-200">
                <CardBody className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-small font-medium">
                      Packing #{packingIndex + 1}
                    </h5>
                    <Button
                      size="sm"
                      variant="light"
                      startContent={<Trash size={14} />}
                      onPress={() =>
                        onUpdate((current) => ({
                          ...current,
                          packings: current.packings.filter(
                            (_, idx) => idx !== packingIndex
                          ),
                        }))
                      }
                      isDisabled={isBusy}
                    >
                      {t("actions.remove")}
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <IBaseInput
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
                              : p
                          ),
                        }))
                      }
                      isDisabled={isBusy}
                    />
                    <IBaseInput
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
                              : p
                          ),
                        }))
                      }
                      isDisabled={isBusy}
                    />
                  </div>
                  <IBaseTextarea
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
                            : p
                        ),
                      }))
                    }
                    isDisabled={isBusy}
                  />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Divider />

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
          <Button
            size="sm"
            variant="bordered"
            startContent={<Plus size={14} />}
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
            isDisabled={isBusy}
          >
            {tProductForm("addAttribute")}
          </Button>
        </div>

        {!value.attributes || value.attributes.length === 0 ? (
          <p className="text-small text-default-500">
            {tProductForm("noAttributeEntries")}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {value.attributes.map((attribute, attributeIndex) => (
              <Card key={attributeIndex} className="border border-default-200">
                <CardBody className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-small font-medium">
                      Attribute #{attributeIndex + 1}
                    </h5>
                    <Button
                      size="sm"
                      variant="light"
                      startContent={<Trash size={14} />}
                      onPress={() =>
                        onUpdate((current) => ({
                          ...current,
                          attributes: current.attributes.filter(
                            (_, idx) => idx !== attributeIndex
                          ),
                        }))
                      }
                      isDisabled={isBusy}
                    >
                      {t("actions.remove")}
                    </Button>
                  </div>
                  <IBaseInput
                    label={t("code")}
                    value={attribute.code}
                    onValueChange={(next) =>
                      onUpdate((current) => ({
                        ...current,
                        attributes: current.attributes.map((a, idx) =>
                          idx === attributeIndex ? { ...a, code: next } : a
                        ),
                      }))
                    }
                    isInvalid={Boolean(
                      variantErrors?.attributes?.[attributeIndex]?.code
                    )}
                    errorMessage={
                      variantErrors?.attributes?.[attributeIndex]?.code?.message
                    }
                    isDisabled={isBusy}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <IBaseInput
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
                              : a
                          ),
                        }))
                      }
                      isDisabled={isBusy}
                    />
                    <IBaseInput
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
                              : a
                          ),
                        }))
                      }
                      isDisabled={isBusy}
                    />
                  </div>
                  <IBaseInput
                    label={t("value")}
                    value={attribute.value}
                    onValueChange={(next) =>
                      onUpdate((current) => ({
                        ...current,
                        attributes: current.attributes.map((a, idx) =>
                          idx === attributeIndex ? { ...a, value: next } : a
                        ),
                      }))
                    }
                    isInvalid={Boolean(
                      variantErrors?.attributes?.[attributeIndex]?.value
                    )}
                    errorMessage={
                      variantErrors?.attributes?.[attributeIndex]?.value
                        ?.message
                    }
                    isDisabled={isBusy}
                  />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <IBaseTextarea
        label={t("description")}
        value={value.description ?? ""}
        onValueChange={(next) =>
          onUpdate((current) => ({ ...current, description: next }))
        }
        isDisabled={isBusy}
      />
    </div>
  );
}
