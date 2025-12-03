"use client";

import {
  IBaseSingleSelect,
  IBaseSingleSelectAsync,
  SelectItemOption,
} from "@base/client/components";
import { useTranslations } from "next-intl";
import { Control, Controller } from "react-hook-form";

interface GeneralInfoSectionProps {
  control: Control<any>;
  warehouseOptions: SelectItemOption[];
  watchedPriceListId?: string;
  createdAt?: string;
  currency?: string;
  errors?: any;
}

export default function GeneralInfoSection({
  control,
  warehouseOptions,
  watchedPriceListId,
  createdAt,
  currency,
  errors,
}: GeneralInfoSectionProps) {
  const t = useTranslations("b2cSales.order.create.labels");
  return (
    <div>
      <h2 className="text-base font-semibold mb-2">{t("generalInfo")}</h2>
      <div className="text-sm text-default-700 py-2 text-bold mb-3">
        {t("createdAt")}: {createdAt || "—"}, {t("currency")}: {currency}
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        {/* Pricing */}
        <Controller
          name="priceListId"
          control={control}
          render={({ field, fieldState }) => (
            <IBaseSingleSelectAsync
              label={t("pricing")}
              size="sm"
              model="b2c-sales.price-list.view-list"
              selectedKey={field.value}
              onSelectionChange={(key) => {
                field.onChange(key || undefined);
              }}
              isRequired
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="warehouseId"
          control={control}
          render={({ field, fieldState }) => (
            <IBaseSingleSelect
              label={t("warehouse")}
              size="sm"
              items={warehouseOptions}
              selectedKey={field.value}
              onSelectionChange={(key) => {
                field.onChange(key || undefined);
              }}
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </div>
    </div>
  );
}
