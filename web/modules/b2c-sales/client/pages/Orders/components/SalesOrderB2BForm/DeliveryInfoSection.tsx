"use client";

import { IBaseInput, IBaseInputNumber, IBaseSingleSelect, SelectItemOption } from "@base/client/components";
import { useTranslations } from "next-intl";
import { Control, Controller } from "react-hook-form";

interface DeliveryInfoSectionProps {
  control: Control<any>;
  paymentMethodOptions: SelectItemOption[];
  shippingMethodOptions: SelectItemOption[];
  shippingTermOptions: SelectItemOption[];
  isShippingOtherThanPickup: boolean;
  errors?: any;
}

export default function DeliveryInfoSection({
  control,
  paymentMethodOptions,
  shippingMethodOptions,
  shippingTermOptions,
  isShippingOtherThanPickup,
  errors,
}: DeliveryInfoSectionProps) {
  const t = useTranslations("b2cSales.order.create.labels");
  return (
    <div>
      <h2 className="text-base font-semibold mb-2">{t("deliveryInfo")}</h2>
      <div className="grid gap-2 md:grid-cols-2">
        <Controller
          name="paymentMethodId"
          control={control}
          render={({ field, fieldState }) => (
            <IBaseSingleSelect
              label={t("paymentMethod")}
              size="sm"
              items={paymentMethodOptions}
              selectedKey={field.value}
              onSelectionChange={(key) => {
                field.onChange(key || undefined);
              }}
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="shippingMethodId"
          control={control}
          render={({ field, fieldState }) => (
            <IBaseSingleSelect
              label={t("shippingMethod")}
              size="sm"
              items={shippingMethodOptions}
              selectedKey={field.value}
              onSelectionChange={(key) => {
                field.onChange(key || undefined);
              }}
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
        {isShippingOtherThanPickup && (
          <>
            <Controller
              name="deliveryAddress"
              control={control}
              rules={{
                required: isShippingOtherThanPickup
                  ? t("shippingAddressRequired")
                  : false,
              }}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  label={t("shippingAddress")}
                  isRequired={isShippingOtherThanPickup}
                  isInvalid={
                    fieldState.invalid ||
                    (isShippingOtherThanPickup && !field.value?.trim())
                  }
                  errorMessage={
                    fieldState.error?.message ||
                    (isShippingOtherThanPickup && !field.value?.trim()
                      ? t("shippingAddressRequired")
                      : undefined)
                  }
                />
              )}
            />
            <Controller
              name="shippingFee"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  value={field.value ? Number(field.value) : 0}
                  onValueChange={(val) => field.onChange(val?.toString() ?? "0")}
                  size="sm"
                  label={t("shippingFee")}
                  min={0}
                  decimalPlaces={2}
                  allowNegative={false}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="expectedDate"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  size="sm"
                  type="date"
                  label={t("deliveryDate")}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </>
        )}
      </div>
    </div>
  );
}

