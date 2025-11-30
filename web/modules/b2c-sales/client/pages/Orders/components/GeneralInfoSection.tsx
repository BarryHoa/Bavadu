"use client";

import { IBaseInput, IBaseSingleSelect, SelectItemOption } from "@base/client/components";
import { Control, Controller } from "react-hook-form";

interface GeneralInfoSectionProps {
  control: Control<any>;
  priceListOptions: SelectItemOption[];
  currencyOptions: SelectItemOption[];
  warehouseOptions: SelectItemOption[];
  watchedPriceListId?: string;
  errors?: any;
}

export default function GeneralInfoSection({
  control,
  priceListOptions,
  currencyOptions,
  warehouseOptions,
  watchedPriceListId,
  errors,
}: GeneralInfoSectionProps) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-2">Thông tin chung</h2>
      <div className="grid gap-2 md:grid-cols-3">
        <Controller
          name="priceListId"
          control={control}
          render={({ field, fieldState }) => (
            <IBaseSingleSelect
              label="Price List"
              size="sm"
              items={priceListOptions}
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
              isDisabled={!!watchedPriceListId}
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

