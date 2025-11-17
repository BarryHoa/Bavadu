"use client";

import {
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseSelectWithSearch,
  SelectItemOption,
} from "@base/client/components";
import { Checkbox, CheckboxGroup, Textarea } from "@heroui/react";
import {
  ProductMasterFeatures,
  ProductMasterType,
} from "../../interface/Product";
import type { MasterFieldValue } from "./types";

type MasterTabProps = {
  value: MasterFieldValue;
  categoryOptions: SelectItemOption[];
  masterTypes: SelectItemOption[];
  featureOptions: { key: ProductMasterFeatures; label: string }[];
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
  errors,
  isBusy,
  categoryQueryLoading,
  onUpdate,
}: MasterTabProps) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <IBaseInputMultipleLang
        label="Name"
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

      <div className="grid gap-4 md:grid-cols-2">
        <IBaseInput
          label="Code"
          value={value.code ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, code: next }))
          }
          isRequired
          isInvalid={Boolean(errors?.code)}
          errorMessage={errors?.code?.message}
          isDisabled={isBusy}
        />

        <IBaseSelectWithSearch
          label="Product type"
          items={masterTypes}
          selectedKeys={value.type ? [value.type] : []}
          onSelectionChange={(keys) => {
            const keySet = keys as Set<string>;
            const [first] = Array.from(keySet);
            const next =
              (first as ProductMasterType) || ProductMasterType.GOODS;
            onUpdate((current) => ({ ...current, type: next }));
          }}
          isInvalid={Boolean(errors?.type)}
          errorMessage={errors?.type?.message}
          isDisabled={isBusy}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <IBaseSelectWithSearch
          label="Category"
          items={categoryOptions}
          selectedKeys={value.categoryId ? [value.categoryId] : []}
          onSelectionChange={(keys) => {
            const keySet = keys as Set<string>;
            const [first] = Array.from(keySet);
            const nextValue =
              typeof first === "string" && first.length > 0 ? first : undefined;
            onUpdate((current) => ({ ...current, categoryId: nextValue }));
          }}
          isLoading={categoryQueryLoading}
          isInvalid={Boolean(errors?.categoryId)}
          errorMessage={errors?.categoryId?.message}
          isDisabled={isBusy || categoryQueryLoading}
        />

        <IBaseInput
          label="Brand"
          value={value.brand ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, brand: next }))
          }
          isDisabled={isBusy}
        />
      </div>

      <CheckboxGroup
        label="Product features"
        orientation="horizontal"
        value={featureOptions
          .filter((feature) => value.features?.[feature.key])
          .map((feature) => feature.key)}
        onChange={(selected) => {
          const selectedSet = new Set(selected as string[]);
          onUpdate((current) => ({
            ...current,
            features: featureOptions.reduce(
              (acc, feature) => ({
                ...acc,
                [feature.key]: selectedSet.has(feature.key),
              }),
              {} as Record<ProductMasterFeatures, boolean>
            ),
          }));
        }}
        classNames={{ wrapper: "flex flex-wrap gap-3" }}
        isDisabled={isBusy}
      >
        {featureOptions.map((feature) => (
          <Checkbox key={feature.key} value={feature.key} isDisabled={isBusy}>
            {feature.label}
          </Checkbox>
        ))}
      </CheckboxGroup>

      <Textarea
        label="Description"
        value={value.description ?? ""}
        onValueChange={(next) =>
          onUpdate((current) => ({ ...current, description: next }))
        }
        isDisabled={isBusy}
      />
    </div>
  );
}
