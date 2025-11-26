"use client";

import {
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseSingleSelect,
  SelectItemOption,
} from "@base/client/components";
import { IBaseTooltip } from "@base/client/components";
import { Checkbox, CheckboxGroup, Textarea } from "@heroui/react";
import { HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  ProductMasterFeatures,
  ProductMasterType,
} from "../../interface/Product";
import {
  FORBIDDEN_FEATURES_BY_TYPE,
  REQUIRED_FEATURES_BY_TYPE,
} from "../../utils/product-features-validator";
import type { MasterFieldValue } from "./types";

type MasterTabProps = {
  value: MasterFieldValue;
  categoryOptions: SelectItemOption[];
  masterTypes: SelectItemOption[];
  featureOptions: { key: ProductMasterFeatures; label: string }[];
  disabledFeatures?: Set<string>;
  errors?: {
    name?: { en?: { message?: string } };
    code?: { message?: string };
    categoryId?: { message?: string };
    type?: { message?: string };
  };
  isBusy: boolean;
  categoryQueryLoading: boolean;
  onUpdate: (updater: (current: MasterFieldValue) => MasterFieldValue) => void;
};

export default function MasterTab({
  value,
  categoryOptions,
  masterTypes,
  featureOptions,
  disabledFeatures = new Set(),
  errors,
  isBusy,
  categoryQueryLoading,
  onUpdate,
}: MasterTabProps) {
  const t = useTranslations("common");
  const tProduct = useTranslations("mdl-product");

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
      (feature) => !forbiddenFeatures.has(feature.key)
    );
  }, [featureOptions, forbiddenFeatures]);

  // Check if a feature is required
  const isFeatureRequired = (featureKey: ProductMasterFeatures) => {
    return requiredFeatures.has(featureKey);
  };

  return (
    <div className="flex flex-col gap-4 pt-4">
      <IBaseInputMultipleLang
        label={t("name")}
        value={value.name}
        onValueChange={(langs) =>
          onUpdate((current) => ({
            ...current,
            name: langs as MasterFieldValue["name"],
          }))
        }
        isRequired
        isInvalid={Boolean(errors?.name?.en)}
        errorMessage={errors?.name?.en?.message}
        isDisabled={isBusy}
      />

      <div className="grid gap-4 md:grid-cols-2 items-start">
        <IBaseInput
          label={t("code")}
          value={value.code ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, code: next }))
          }
          isRequired
          isInvalid={Boolean(errors?.code)}
          errorMessage={errors?.code?.message}
          isDisabled={isBusy}
        />

        <IBaseSingleSelect
          label={tProduct("productType")}
          items={masterTypes}
          selectedKey={
            value.type && masterTypes.some((item) => item.value === value.type)
              ? value.type
              : undefined
          }
          onSelectionChange={(key) => {
            const next =
              (key as ProductMasterType) || ProductMasterType.GOODS;
            onUpdate((current) => ({ ...current, type: next }));
          }}
          isInvalid={Boolean(errors?.type)}
          errorMessage={errors?.type?.message}
          isDisabled={isBusy}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 items-start">
        <IBaseSingleSelect
          label={t("category")}
          items={categoryOptions}
          selectedKey={value.categoryId}
          onSelectionChange={(key) => {
            onUpdate((current) => ({ ...current, categoryId: key || undefined }));
          }}
          isLoading={categoryQueryLoading}
          isInvalid={Boolean(errors?.categoryId)}
          errorMessage={errors?.categoryId?.message}
          isDisabled={isBusy || categoryQueryLoading}
        />

        <IBaseInput
          label={t("brand")}
          value={value.brand ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, brand: next }))
          }
          isDisabled={isBusy}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">
            {tProduct("productFeatures")}
          </label>
          <IBaseTooltip content={tProduct("productFeaturesTooltip")} placement="top">
            <HelpCircle
              size={16}
              className="text-default-400 cursor-help"
              aria-label="Thông tin về tính năng sản phẩm"
            />
          </IBaseTooltip>
        </div>
        <CheckboxGroup
          orientation="horizontal"
          value={allowedFeatureOptions
            .filter((feature) => value.features?.[feature.key])
            .map((feature) => feature.key)}
          onChange={(selected) => {
            const selectedSet = new Set(selected as string[]);
            onUpdate((current) => ({
              ...current,
              features: featureOptions.reduce(
                (acc, feature) => {
                  // If feature is forbidden, set to false and don't allow changes
                  if (forbiddenFeatures.has(feature.key)) {
                    acc[feature.key] = false;
                    return acc;
                  }
                  // If feature is disabled, keep it false
                  // If feature is required, keep it true (prevent unchecking)
                  acc[feature.key] = disabledFeatures.has(feature.key)
                    ? false
                    : isFeatureRequired(feature.key)
                      ? true
                      : selectedSet.has(feature.key);
                  return acc;
                },
                {} as Record<ProductMasterFeatures, boolean>
              ),
            }));
          }}
          classNames={{ wrapper: "flex flex-wrap gap-3" }}
          isDisabled={isBusy}
        >
          {allowedFeatureOptions.map((feature) => {
            const isRequired = isFeatureRequired(feature.key);
            return (
              <Checkbox
                key={feature.key}
                value={feature.key}
                isDisabled={
                  isBusy || disabledFeatures.has(feature.key) || isRequired
                }
                color={isRequired ? "danger" : undefined}
                classNames={{
                  label: isRequired ? "text-danger font-medium" : "",
                }}
              >
                {feature.label}
              </Checkbox>
            );
          })}
        </CheckboxGroup>
      </div>

      <Textarea
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
