"use client";

import { IBaseSingleSelectAsync } from "@base/client/components";
import { useTranslations } from "next-intl";
import { Control, Controller } from "react-hook-form";
import { useSalesOrderB2BForm } from "../../contexts/SalesOrderB2BFormContext";

interface GeneralInfoSectionProps {
  control: Control<any>;
  createdAt?: string;
  currency?: string;
}

export default function GeneralInfoSection({
  control,
  createdAt,
  currency,
}: GeneralInfoSectionProps) {
  const t = useTranslations("b2cSales.order.create.labels");
  const { page } = useSalesOrderB2BForm();
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
              model="b2c-sales-price-list"
              selectedKey={field.value}
              onSelectionChange={(key) => {
                field.onChange(key || undefined);
              }}
              callWhen="mount"
              isRequired
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
              onTheFirstFetchSuccess={(data) => {
                if (page === "create") {
                  if (!field.value && data?.data?.length > 0) {
                    field.onChange(data.data[0].value);
                  }
                }
              }}
            />
          )}
        />

        <Controller
          name="warehouseId"
          control={control}
          render={({ field, fieldState }) => (
            <IBaseSingleSelectAsync
              label={t("warehouse")}
              model="b2c-sales-warehouse"
              selectedKey={field.value}
              onSelectionChange={(key) => {
                field.onChange(key || undefined);
              }}
              callWhen="mount"
              isRequired
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
              onTheFirstFetchSuccess={(data) => {
                if (page === "create") {
                  if (!field.value && data?.data?.length > 0) {
                    field.onChange(data.data[0].value);
                  }
                }
              }}
            />
          )}
        />
      </div>
    </div>
  );
}
