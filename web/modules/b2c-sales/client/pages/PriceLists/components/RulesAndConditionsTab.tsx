"use client";

import { IBaseButton, IBaseCard, IBaseCheckbox } from "@base/client/components";
import {
  IBaseCardBody,
  IBaseInput,
  IBaseSingleSelect,
  SelectItemOption,
} from "@base/client/components";
import { Control, Controller, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

interface RulesAndConditionsIBaseTabProps {
  control: Control<any>;
  errors?: any;
  categoryOptions?: SelectItemOption[];
  brandOptions?: SelectItemOption[];
}

export default function RulesAndConditionsTab({
  control,
  errors,
  categoryOptions = [],
  brandOptions = [],
}: RulesAndConditionsIBaseTabProps) {
  const {
    fields: ruleFields,
    append: appendRule,
    remove: removeRule,
  } = useFieldArray({
    control,
    name: "pricingRules",
  });

  const ruleMethodOptions: SelectItemOption[] = [
    { value: "fixed", label: "Fixed Price" },
    { value: "percentage", label: "Percentage Discount" },
    { value: "formula", label: "Formula" },
    { value: "tiered", label: "Tiered Pricing" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Pricing Rules</h3>
        <IBaseButton
          color="primary"
          size="sm"
          startContent={<Plus size={16} />}
          variant="flat"
          onPress={() =>
            appendRule({
              name: "",
              method: "fixed",
              value: "",
              conditions: {},
              applyToExceptions: false,
            })
          }
        >
          Add Rule
        </IBaseButton>
      </div>

      {ruleFields.length === 0 ? (
        <div className="text-sm text-default-500 py-4 text-center">
          No pricing rules. Click "Add Rule" to add one.
        </div>
      ) : (
        <div className="space-y-3">
          {ruleFields.map((field, index) => (
            <IBaseCard key={field.id} className="p-4">
              <IBaseCardBody className="p-0 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    control={control}
                    name={`pricingRules.${index}.name`}
                    render={({ field, fieldState }) => (
                      <IBaseInput
                        isRequired
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                        label="Rule Name"
                        size="sm"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`pricingRules.${index}.method`}
                    render={({ field, fieldState }) => (
                      <IBaseSingleSelect
                        isRequired
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                        items={ruleMethodOptions}
                        label="Method"
                        selectedKey={field.value}
                        size="sm"
                        onSelectionChange={(key) => {
                          field.onChange(key || "");
                        }}
                      />
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    control={control}
                    name={`pricingRules.${index}.value`}
                    render={({ field, fieldState }) => (
                      <IBaseInput
                        isRequired
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                        label="Value"
                        placeholder="Enter value or formula"
                        size="sm"
                        type="number"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <div className="flex items-end">
                    <Controller
                      control={control}
                      name={`pricingRules.${index}.applyToExceptions`}
                      render={({ field }) => (
                        <IBaseCheckbox
                          isSelected={field.value === true}
                          size="sm"
                          onValueChange={field.onChange}
                        >
                          Apply to Exceptions
                        </IBaseCheckbox>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium mb-2">Conditions</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                      control={control}
                      name={`pricingRules.${index}.conditions.categories`}
                      render={({ field }) => (
                        <IBaseSingleSelect
                          items={categoryOptions}
                          label="Categories"
                          selectedKey={field.value}
                          size="sm"
                          onSelectionChange={(key) => {
                            field.onChange(key || undefined);
                          }}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name={`pricingRules.${index}.conditions.brands`}
                      render={({ field }) => (
                        <IBaseSingleSelect
                          items={brandOptions}
                          label="Brands"
                          selectedKey={field.value}
                          size="sm"
                          onSelectionChange={(key) => {
                            field.onChange(key || undefined);
                          }}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <IBaseButton
                    color="danger"
                    size="sm"
                    startContent={<Trash2 size={16} />}
                    variant="light"
                    onPress={() => removeRule(index)}
                  >
                    Remove
                  </IBaseButton>
                </div>
              </IBaseCardBody>
            </IBaseCard>
          ))}
        </div>
      )}
    </div>
  );
}
