"use client";

import { Control, UseFormSetValue } from "react-hook-form";

import { IBaseTabsPrimary, SelectItemOption, IBaseTabPrimary } from "@base/client/components";

import ExplicitPricingTab from "./ExplicitPricingTab";
import MainTab from "./MainTab";
import RulesAndConditionsTab from "./RulesAndConditionsTab";

interface PriceListFormProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  errors?: any;
  typeOptions: SelectItemOption[];
  statusOptions: SelectItemOption[];
  isEdit?: boolean;
  // Options for applicableTo selects
  channelOptions?: SelectItemOption[];
  storeOptions?: SelectItemOption[];
  locationOptions?: SelectItemOption[];
  regionOptions?: SelectItemOption[];
  customerGroupOptions?: SelectItemOption[];
  // Options for explicit pricing
  productOptions?: SelectItemOption[];
  // Options for rules
  categoryOptions?: SelectItemOption[];
  brandOptions?: SelectItemOption[];
}

export default function PriceListForm({
  control,
  setValue,
  errors,
  typeOptions,
  statusOptions,
  isEdit = false,
  channelOptions = [],
  storeOptions = [],
  locationOptions = [],
  regionOptions = [],
  customerGroupOptions = [],
  productOptions = [],
  categoryOptions = [],
  brandOptions = [],
}: PriceListFormProps) {
  return (
    <IBaseTabsPrimary
      aria-label="Price List Form Tabs"
      classNames={{
        tab: "max-w-[200px]",
        tabContent: "truncate",
      }}
    >
      <IBaseTabPrimary key="main" title="Main">
        <MainTab
          channelOptions={channelOptions}
          control={control}
          customerGroupOptions={customerGroupOptions}
          errors={errors}
          isEdit={isEdit}
          locationOptions={locationOptions}
          regionOptions={regionOptions}
          statusOptions={statusOptions}
          storeOptions={storeOptions}
          typeOptions={typeOptions}
        />
      </IBaseTabPrimary>

      <IBaseTabPrimary key="rules" title="Rules and Conditions">
        <RulesAndConditionsTab
          brandOptions={brandOptions}
          categoryOptions={categoryOptions}
          control={control}
          errors={errors}
        />
      </IBaseTabPrimary>

      <IBaseTabPrimary key="pricing" title="Explicit Pricing">
        <ExplicitPricingTab
          control={control}
          errors={errors}
          setValue={setValue}
        />
      </IBaseTabPrimary>
    </IBaseTabsPrimary>
  );
}
