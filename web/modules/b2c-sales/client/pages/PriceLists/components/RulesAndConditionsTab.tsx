"use client";

import { IBaseInput, IBaseSingleSelect, SelectItemOption } from "@base/client/components";
import { Button } from "@heroui/button";
import { Card, CardBody, Checkbox, Textarea } from "@heroui/react";
import { Control, Controller, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

interface RulesAndConditionsTabProps {
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
}: RulesAndConditionsTabProps) {
  const { fields: ruleFields, append: appendRule, remove: removeRule } = useFieldArray({
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
        <Button
          size="sm"
          color="primary"
          variant="flat"
          startContent={<Plus size={16} />}
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
        </Button>
      </div>

      {ruleFields.length === 0 ? (
        <div className="text-sm text-default-500 py-4 text-center">
          No pricing rules. Click "Add Rule" to add one.
        </div>
      ) : (
        <div className="space-y-3">
          {ruleFields.map((field, index) => (
            <Card key={field.id} className="p-4">
              <CardBody className="p-0 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    name={`pricingRules.${index}.name`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <IBaseInput
                        label="Rule Name"
                        size="sm"
                        value={field.value}
                        onChange={field.onChange}
                        isRequired
                        isInvalid={fieldState.invalid}
                        errorMessage={fieldState.error?.message}
                      />
                    )}
                  />
                  <Controller
                    name={`pricingRules.${index}.method`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <IBaseSingleSelect
                        label="Method"
                        size="sm"
                        items={ruleMethodOptions}
                        selectedKey={field.value}
                        onSelectionChange={(key) => {
                          field.onChange(key || "");
                        }}
                        isRequired
                        isInvalid={fieldState.invalid}
                        errorMessage={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    name={`pricingRules.${index}.value`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <IBaseInput
                        label="Value"
                        size="sm"
                        type="number"
                        value={field.value}
                        onChange={field.onChange}
                        isRequired
                        isInvalid={fieldState.invalid}
                        errorMessage={fieldState.error?.message}
                        placeholder="Enter value or formula"
                      />
                    )}
                  />
                  <div className="flex items-end">
                    <Controller
                      name={`pricingRules.${index}.applyToExceptions`}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          size="sm"
                          isSelected={field.value === true}
                          onValueChange={field.onChange}
                        >
                          Apply to Exceptions
                        </Checkbox>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium mb-2">Conditions</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                      name={`pricingRules.${index}.conditions.categories`}
                      control={control}
                      render={({ field }) => (
                        <IBaseSingleSelect
                          label="Categories"
                          size="sm"
                          items={categoryOptions}
                          selectedKey={field.value}
                          onSelectionChange={(key) => {
                            field.onChange(key || undefined);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name={`pricingRules.${index}.conditions.brands`}
                      control={control}
                      render={({ field }) => (
                        <IBaseSingleSelect
                          label="Brands"
                          size="sm"
                          items={brandOptions}
                          selectedKey={field.value}
                          onSelectionChange={(key) => {
                            field.onChange(key || undefined);
                          }}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    startContent={<Trash2 size={16} />}
                    onPress={() => removeRule(index)}
                  >
                    Remove
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

