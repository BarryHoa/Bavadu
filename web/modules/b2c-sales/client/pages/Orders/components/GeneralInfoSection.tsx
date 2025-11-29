"use client";

import { IBaseInput, IBaseSingleSelect, SelectItemOption } from "@base/client/components";
import { Control, Controller } from "react-hook-form";

interface GeneralInfoSectionProps {
  control: Control<any>;
  pricingOptions: SelectItemOption[];
  currencyOptions: SelectItemOption[];
  warehouseOptions: SelectItemOption[];
  watchedPricingId?: string;
  errors?: any;
}

export default function GeneralInfoSection({
  control,
  pricingOptions,
  currencyOptions,
  warehouseOptions,
  watchedPricingId,
  errors,
}: GeneralInfoSectionProps) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-2">Thông tin chung</h2>
      <div className="grid gap-2 md:grid-cols-3">
        <Controller
          name="pricingId"
          control={control}
          render={({ field, fieldState }) => (
            <IBaseSingleSelect
              label="Pricing"
              size="sm"
              items={pricingOptions}
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
          name="currency"
          control={control}
          render={({ field, fieldState }) => (
            <IBaseSingleSelect
              label="Currency"
              size="sm"
              items={currencyOptions}
              selectedKey={field.value}
              onSelectionChange={(key) => {
                field.onChange(key || undefined);
              }}
              isRequired
              isDisabled={!!watchedPricingId}
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
              label="Warehouse"
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

