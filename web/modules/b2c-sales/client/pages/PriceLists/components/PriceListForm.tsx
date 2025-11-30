"use client";

import { IBaseTabs, SelectItemOption, Tab } from "@base/client/components";
import { Control, UseFormSetValue } from "react-hook-form";
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
    <IBaseTabs
      aria-label="Price List Form Tabs"
      color="primary"
      classNames={{
        tab: "max-w-[200px]",
        tabContent: "truncate",
      }}
    >
      <Tab key="main" title="Main">
        <MainTab
          control={control}
          errors={errors}
          typeOptions={typeOptions}
          statusOptions={statusOptions}
          isEdit={isEdit}
          channelOptions={channelOptions}
          storeOptions={storeOptions}
          locationOptions={locationOptions}
          regionOptions={regionOptions}
          customerGroupOptions={customerGroupOptions}
        />
      </Tab>

      <Tab key="rules" title="Rules and Conditions">
        <RulesAndConditionsTab
          control={control}
          errors={errors}
          categoryOptions={categoryOptions}
          brandOptions={brandOptions}
        />
      </Tab>

      <Tab key="pricing" title="Explicit Pricing">
        <ExplicitPricingTab
          control={control}
          setValue={setValue}
          errors={errors}
        />
      </Tab>
    </IBaseTabs>
  );
}
