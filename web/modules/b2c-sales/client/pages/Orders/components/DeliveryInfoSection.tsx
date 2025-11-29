"use client";

import { IBaseInput, IBaseInputNumber, IBaseSingleSelect, SelectItemOption } from "@base/client/components";
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
  return (
    <div>
      <h2 className="text-base font-semibold mb-2">Thông tin giao hàng</h2>
      <div className="grid gap-2 md:grid-cols-2">
        <Controller
          name="paymentMethodId"
          control={control}
          render={({ field, fieldState }) => (
            <IBaseSingleSelect
              label="Payment Method"
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
              label="Shipping Method"
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
                  ? "Shipping Address is required"
                  : false,
              }}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  label="Shipping Address"
                  isRequired={isShippingOtherThanPickup}
                  isInvalid={
                    fieldState.invalid ||
                    (isShippingOtherThanPickup && !field.value?.trim())
                  }
                  errorMessage={
                    fieldState.error?.message ||
                    (isShippingOtherThanPickup && !field.value?.trim()
                      ? "Shipping Address is required"
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
                  label="Shipping Fee"
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
                  label="Ngày giao hàng"
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

