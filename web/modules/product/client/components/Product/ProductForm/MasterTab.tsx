"use client";

import type { MasterFieldValue } from "./types";

import {
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseSingleSelect,
  IBaseSingleSelectAsync,
  IBaseTextarea,
  IBaseTooltip,
  IBaseUploadImageTiny,
  SelectItemOption,
} from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { IBaseCheckbox, IBaseCheckboxGroup } from "@base/client";
import { HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import {
  ProductMasterFeatures,
  ProductMasterType,
} from "../../../interface/Product";
import {
  FORBIDDEN_FEATURES_BY_TYPE,
  REQUIRED_FEATURES_BY_TYPE,
} from "../../../utils/product-features-validator";

type MasterTabProps = {
  value: MasterFieldValue;
  categoryOptions: SelectItemOption[];
  featureOptions: { value: string; label: string }[];
  disabledFeatures?: Set<string>;
  errors?: {
    name?: { en?: { message?: string } };
    code?: { message?: string };
    categoryId?: { message?: string };
    type?: { message?: string };
    images?: { message?: string };
  };
  isBusy: boolean;
  categoryQueryLoading: boolean;
  onUpdate: (updater: (current: MasterFieldValue) => MasterFieldValue) => void;
};

export default function MasterTab({
  value,
  categoryOptions,
  featureOptions,
  disabledFeatures = new Set(),
  errors,
  isBusy,
  categoryQueryLoading,
  onUpdate,
}: MasterTabProps) {
  const t = useTranslations("common");
  const tProduct = useTranslations("mdl-product");
  const getLocalizedText = useLocalizedText();

  // Determine which features are required based on product type
  const requiredFeatures = useMemo(() => {
    if (!value.type) return new Set<ProductMasterFeatures>();
    const required =
      REQUIRED_FEATURES_BY_TYPE[value.type as ProductMasterType] || [];

    return new Set(required);
  }, [value.type]);

  // Determine which features are forbidden based on product type
  const forbiddenFeatures = useMemo(() => {
    if (!value.type) return new Set<ProductMasterFeatures>();
    const forbidden =
      FORBIDDEN_FEATURES_BY_TYPE[value.type as ProductMasterType] || [];

    return new Set(forbidden);
  }, [value.type]);

  // Filter out forbidden features
  const allowedFeatureOptions = useMemo(() => {
    return featureOptions.filter(
      (feature) =>
        !forbiddenFeatures.has(feature.value as ProductMasterFeatures),
    );
  }, [featureOptions, forbiddenFeatures]);

  // Check if a feature is required
  const isFeatureRequired = (featureKey: ProductMasterFeatures) => {
    return requiredFeatures.has(featureKey);
  };

  return (
    <div className="flex flex-col gap-4 pt-4">
      <IBaseInputMultipleLang
        isRequired
        errorMessage={errors?.name?.en?.message}
        isDisabled={isBusy}
        isInvalid={Boolean(errors?.name?.en)}
        label={t("name")}
        value={value.name}
        onValueChange={(langs) =>
          onUpdate((current) => ({
            ...current,
            name: langs as MasterFieldValue["name"],
          }))
        }
      />

      <div className="grid gap-4 md:grid-cols-2 items-start">
        <IBaseInput
          isRequired
          errorMessage={errors?.code?.message}
          isDisabled={isBusy}
          isInvalid={Boolean(errors?.code)}
          label={t("code")}
          value={value.code ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, code: next }))
          }
        />

        <IBaseSingleSelectAsync
          callWhen="mount"
          errorMessage={errors?.type?.message}
          isDisabled={isBusy}
          isInvalid={Boolean(errors?.type)}
          label={tProduct("productType")}
          model="product-type.dropdown"
          selectedKey={value.type || undefined}
          onSelectionChange={(key) => {
            const next = (key as ProductMasterType) || ProductMasterType.GOODS;

            onUpdate((current) => ({ ...current, type: next }));
          }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 items-start">
        <IBaseSingleSelect
          errorMessage={errors?.categoryId?.message}
          isDisabled={isBusy || categoryQueryLoading}
          isInvalid={Boolean(errors?.categoryId)}
          isLoading={categoryQueryLoading}
          items={categoryOptions}
          label={t("category")}
          selectedKey={value.categoryId}
          onSelectionChange={(key) => {
            onUpdate((current) => ({
              ...current,
              categoryId: key || undefined,
            }));
          }}
        />

        <IBaseInput
          isDisabled={isBusy}
          label={t("brand")}
          value={value.brand ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, brand: next }))
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">
            {tProduct("productFeatures")}
          </label>
          <IBaseTooltip
            content={tProduct("productFeaturesTooltip")}
            placement="top"
          >
            <HelpCircle
              aria-label="Thông tin về tính năng sản phẩm"
              className="text-default-400 cursor-help"
              size={16}
            />
          </IBaseTooltip>
        </div>
        <IBaseCheckboxGroup
          classNames={{ wrapper: "flex flex-wrap gap-3" }}
          isDisabled={isBusy}
          orientation="horizontal"
          value={allowedFeatureOptions
            .filter(
              (feature) =>
                value.features?.[feature.value as ProductMasterFeatures],
            )
            .map((feature) => feature.value as ProductMasterFeatures)}
          onChange={(selected) => {
            const selectedSet = new Set(selected as string[]);

            onUpdate((current) => ({
              ...current,
              features: featureOptions.reduce(
                (acc, feature) => {
                  // If feature is forbidden, set to false and don't allow changes
                  if (
                    forbiddenFeatures.has(
                      feature.value as ProductMasterFeatures,
                    )
                  ) {
                    acc[feature.value as ProductMasterFeatures] = false;

                    return acc;
                  }
                  // If feature is disabled, keep it false
                  // If feature is required, keep it true (prevent unchecking)
                  acc[feature.value as ProductMasterFeatures] =
                    disabledFeatures.has(feature.value as ProductMasterFeatures)
                      ? false
                      : isFeatureRequired(
                            feature.value as ProductMasterFeatures,
                          )
                        ? true
                        : selectedSet.has(
                            feature.value as ProductMasterFeatures,
                          );

                  return acc;
                },
                {} as Record<ProductMasterFeatures, boolean>,
              ),
            }));
          }}
        >
          {allowedFeatureOptions.map((feature) => {
            const isRequired = isFeatureRequired(
              feature.value as ProductMasterFeatures,
            );

            return (
              <IBaseCheckbox
                key={feature.value}
                classNames={{
                  label: isRequired ? "text-danger font-medium" : "",
                }}
                color={isRequired ? "danger" : undefined}
                isDisabled={
                  isBusy ||
                  disabledFeatures.has(
                    feature.value as ProductMasterFeatures,
                  ) ||
                  isRequired
                }
                value={feature.value as ProductMasterFeatures}
              >
                {feature.label}
              </IBaseCheckbox>
            );
          })}
        </IBaseCheckboxGroup>
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
        required
        error={errors?.images?.message}
        isDisabled={isBusy}
        label={tProduct("images")}
        maxCount={10}
        maxSize={5 * 1024 * 1024} // 5MB
        values={value.images ?? []}
        onChange={(images) => onUpdate((current) => ({ ...current, images }))}
      />
    </div>
  );
}
