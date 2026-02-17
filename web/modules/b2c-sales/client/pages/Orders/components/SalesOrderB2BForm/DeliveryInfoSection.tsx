"use client";

import { useTranslations } from "next-intl";
import { Control, Controller } from "react-hook-form";

import {
  IBaseInput,
  IBaseInputNumber,
  IBaseSingleSelectAsync,
} from "@base/client/components";

import { useSalesOrderB2BForm } from "../../contexts/SalesOrderB2BFormContext";

interface DeliveryInfoSectionProps {
  control: Control<any>;
  isShippingOtherThanPickup: boolean;
  errors?: any;
}

export default function DeliveryInfoSection({
  control,
  isShippingOtherThanPickup,
  errors,
}: DeliveryInfoSectionProps) {
  const t = useTranslations("b2cSales.order.create.labels");
  const { page } = useSalesOrderB2BForm();

  return (
    <div>
      <h2 className="text-base font-semibold mb-2">{t("deliveryInfo")}</h2>
      <div className="grid gap-2 md:grid-cols-2">
        <Controller
          control={control}
          name="paymentMethodId"
          render={({ field, fieldState }) => (
            <IBaseSingleSelectAsync
              isRequired
              callWhen="mount"
              defaultParams={{ filters: { type: ["b2c", "all"] } }}
              errorMessage={fieldState.error?.message}
              isInvalid={fieldState.invalid}
              label={t("paymentMethod")}
              model="base-payment-method"
              selectedKey={field.value}
              size="sm"
              onSelectionChange={(key) => {
                field.onChange(key || undefined);
              }}
              onTheFirstFetchSuccess={(data) => {
                if (page === "create") {
                  if (!field.value && data?.data?.length > 0) {
                    // Prefer payment method with value 'CASH' if present; else fallback
                    const cashItem = data.data.find(
                      (item: any) => item.code === "CASH",
                    );

                    if (cashItem) {
                      field.onChange(cashItem.value);
                    } else {
                      field.onChange(data?.data[0].value);
                    }
                  }
                }
              }}
            />
          )}
        />
        <Controller
          control={control}
          name="shippingMethodId"
          render={({ field, fieldState }) => (
            <IBaseSingleSelectAsync
              isRequired
              callWhen="mount"
              defaultParams={{ filters: { type: ["b2c", "all"] } }}
              errorMessage={fieldState.error?.message}
              isInvalid={fieldState.invalid}
              label={t("shippingMethod")}
              model="base-shipping-method"
              selectedKey={field.value}
              size="sm"
              onSelectionChange={(key) => {
                field.onChange(key || undefined);
              }}
              onTheFirstFetchSuccess={(data) => {
                if (page === "create") {
                  if (!field.value && data?.data?.length > 0) {
                    // find pickup value in data.data
                    const pickupValue = data.data.find(
                      (item: any) => item.code === "pickup",
                    );

                    if (pickupValue) {
                      field.onChange(pickupValue.value);
                    } else {
                      field.onChange(data.data[0].value);
                    }
                  }
                }
              }}
            />
          )}
        />
        {isShippingOtherThanPickup && (
          <>
            <Controller
              control={control}
              name="deliveryAddress"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={
                    fieldState.error?.message ||
                    (isShippingOtherThanPickup && !field.value?.trim()
                      ? t("shippingAddressRequired")
                      : undefined)
                  }
                  isInvalid={
                    fieldState.invalid ||
                    (isShippingOtherThanPickup && !field.value?.trim())
                  }
                  isRequired={isShippingOtherThanPickup}
                  label={t("shippingAddress")}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              )}
              rules={{
                required: isShippingOtherThanPickup
                  ? t("shippingAddressRequired")
                  : false,
              }}
            />
            <Controller
              control={control}
              name="shippingFee"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  allowNegative={false}
                  decimalPlaces={2}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("shippingFee")}
                  min={0}
                  size="sm"
                  value={field.value ? Number(field.value) : 0}
                  onValueChange={(val) =>
                    field.onChange(val?.toString() ?? "0")
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="expectedDate"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("deliveryDate")}
                  size="sm"
                  type="date"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              )}
            />
          </>
        )}
      </div>
    </div>
  );
}
