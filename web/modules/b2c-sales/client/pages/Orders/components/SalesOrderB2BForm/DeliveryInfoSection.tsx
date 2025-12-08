"use client";

import {
  IBaseInput,
  IBaseInputNumber,
  IBaseSingleSelectAsync,
} from "@base/client/components";
import { useTranslations } from "next-intl";
import { Control, Controller } from "react-hook-form";
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
          name="paymentMethodId"
          control={control}
          render={({ field, fieldState }) => (
            <IBaseSingleSelectAsync
              label={t("paymentMethod")}
              size="sm"
              model="payment-method"
              defaultParams={{ filters: { type: ["b2c", "all"] } }}
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
                    // Prefer payment method with value 'CASH' if present; else fallback
                    const cashItem = data.data.find(
                      (item: any) => item.code === "CASH"
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
          name="shippingMethodId"
          control={control}
          render={({ field, fieldState }) => (
            <IBaseSingleSelectAsync
              label={t("shippingMethod")}
              size="sm"
              model="shipping-method"
              selectedKey={field.value}
              onSelectionChange={(key) => {
                field.onChange(key || undefined);
              }}
              defaultParams={{ filters: { type: ["b2c", "all"] } }}
              callWhen="mount"
              isRequired
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
              onTheFirstFetchSuccess={(data) => {
                if (page === "create") {
                  if (!field.value && data?.data?.length > 0) {
                    // find pickup value in data.data
                    const pickupValue = data.data.find(
                      (item: any) => item.code === "pickup"
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
                  onValueChange={(val) =>
                    field.onChange(val?.toString() ?? "0")
                  }
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
