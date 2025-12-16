"use client";

import {
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseInputNumber,
  IBaseSelect,
  IBaseSingleSelect,
  SelectItem,
  SelectItemOption,
} from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { Checkbox, Textarea } from "@heroui/react";
import { Control, Controller } from "react-hook-form";

interface MainTabProps {
  control: Control<any>;
  errors?: any;
  typeOptions: SelectItemOption[];
  statusOptions: SelectItemOption[];
  isEdit?: boolean;
  channelOptions?: SelectItemOption[];
  storeOptions?: SelectItemOption[];
  locationOptions?: SelectItemOption[];
  regionOptions?: SelectItemOption[];
  customerGroupOptions?: SelectItemOption[];
}

export default function MainTab({
  control,
  errors,
  typeOptions,
  statusOptions,
  isEdit = false,
  channelOptions = [],
  storeOptions = [],
  locationOptions = [],
  regionOptions = [],
  customerGroupOptions = [],
}: MainTabProps) {
  const getLocalizedText = useLocalizedText();

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Basic Information</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <IBaseInputMultipleLang
                isRequired
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label="Name"
                size="sm"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="code"
            render={({ field, fieldState }) => (
              <IBaseInput
                isRequired
                errorMessage={fieldState.error?.message}
                isDisabled={isEdit}
                isInvalid={fieldState.invalid}
                label="Code"
                size="sm"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="type"
            render={({ field, fieldState }) => (
              <IBaseSingleSelect
                isRequired
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                items={typeOptions}
                label="Type"
                selectedKey={field.value}
                size="sm"
                onSelectionChange={(key) => {
                  field.onChange(key || "");
                }}
              />
            )}
          />
        </div>
        <div className="mt-4">
          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <Textarea
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label="Description"
                minRows={2}
                size="sm"
                value={field.value || ""}
                onValueChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      {/* Status & Priority */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Status & Priority</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            control={control}
            name="status"
            render={({ field, fieldState }) => (
              <IBaseSingleSelect
                isRequired
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                items={statusOptions}
                label="Status"
                selectedKey={field.value}
                size="sm"
                onSelectionChange={(key) => {
                  field.onChange(key || "");
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="priority"
            render={({ field, fieldState }) => (
              <IBaseInputNumber
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label="Priority"
                min={0}
                size="sm"
                value={field.value ? Number(field.value) : 0}
                onValueChange={(value) =>
                  field.onChange(value?.toString() || "0")
                }
              />
            )}
          />
          <div className="flex items-end">
            <Controller
              control={control}
              name="isDefault"
              render={({ field }) => (
                <Checkbox
                  isSelected={field.value === "true" || field.value === true}
                  size="sm"
                  onValueChange={(checked) =>
                    field.onChange(checked ? "true" : "false")
                  }
                >
                  Is Default
                </Checkbox>
              )}
            />
          </div>
        </div>
      </div>

      {/* Validity Period */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Validity Period</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            control={control}
            name="validFrom"
            render={({ field, fieldState }) => (
              <IBaseInput
                isRequired
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label="Valid From"
                size="sm"
                type="date"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="validTo"
            render={({ field, fieldState }) => (
              <IBaseInput
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label="Valid To (leave empty for forever - standard only)"
                size="sm"
                type="date"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <div />
        </div>
      </div>

      {/* Applicable To */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Applicable To</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Controller
            control={control}
            name="applicableTo.channels"
            render={({ field, fieldState }) => (
              <IBaseSelect
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label="Channels"
                selectedKeys={
                  field.value
                    ? new Set(
                        Array.isArray(field.value)
                          ? field.value
                          : [field.value],
                      )
                    : new Set()
                }
                selectionMode="multiple"
                size="sm"
                onSelectionChange={(keys) => {
                  const selectedArray = Array.from(keys);

                  field.onChange(
                    selectedArray.length > 0 ? selectedArray : undefined,
                  );
                }}
              >
                {channelOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    textValue={
                      typeof option.label === "string"
                        ? option.label
                        : getLocalizedText(option.label)
                    }
                  >
                    {typeof option.label === "string"
                      ? option.label
                      : getLocalizedText(option.label)}
                  </SelectItem>
                ))}
              </IBaseSelect>
            )}
          />
          <Controller
            control={control}
            name="applicableTo.stores"
            render={({ field, fieldState }) => (
              <IBaseSelect
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label="Stores"
                selectedKeys={
                  field.value
                    ? new Set(
                        Array.isArray(field.value)
                          ? field.value
                          : [field.value],
                      )
                    : new Set()
                }
                selectionMode="multiple"
                size="sm"
                onSelectionChange={(keys) => {
                  const selectedArray = Array.from(keys);

                  field.onChange(
                    selectedArray.length > 0 ? selectedArray : undefined,
                  );
                }}
              >
                {storeOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    textValue={
                      typeof option.label === "string"
                        ? option.label
                        : getLocalizedText(option.label)
                    }
                  >
                    {typeof option.label === "string"
                      ? option.label
                      : getLocalizedText(option.label)}
                  </SelectItem>
                ))}
              </IBaseSelect>
            )}
          />
          <Controller
            control={control}
            name="applicableTo.locations"
            render={({ field, fieldState }) => (
              <IBaseSelect
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label="Locations"
                selectedKeys={
                  field.value
                    ? new Set(
                        Array.isArray(field.value)
                          ? field.value
                          : [field.value],
                      )
                    : new Set()
                }
                selectionMode="multiple"
                size="sm"
                onSelectionChange={(keys) => {
                  const selectedArray = Array.from(keys);

                  field.onChange(
                    selectedArray.length > 0 ? selectedArray : undefined,
                  );
                }}
              >
                {locationOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    textValue={
                      typeof option.label === "string"
                        ? option.label
                        : getLocalizedText(option.label)
                    }
                  >
                    {typeof option.label === "string"
                      ? option.label
                      : getLocalizedText(option.label)}
                  </SelectItem>
                ))}
              </IBaseSelect>
            )}
          />
          <Controller
            control={control}
            name="applicableTo.regions"
            render={({ field, fieldState }) => (
              <IBaseSelect
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label="Regions"
                selectedKeys={
                  field.value
                    ? new Set(
                        Array.isArray(field.value)
                          ? field.value
                          : [field.value],
                      )
                    : new Set()
                }
                selectionMode="multiple"
                size="sm"
                onSelectionChange={(keys) => {
                  const selectedArray = Array.from(keys);

                  field.onChange(
                    selectedArray.length > 0 ? selectedArray : undefined,
                  );
                }}
              >
                {regionOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    textValue={
                      typeof option.label === "string"
                        ? option.label
                        : getLocalizedText(option.label)
                    }
                  >
                    {typeof option.label === "string"
                      ? option.label
                      : getLocalizedText(option.label)}
                  </SelectItem>
                ))}
              </IBaseSelect>
            )}
          />
          <Controller
            control={control}
            name="applicableTo.customerGroups"
            render={({ field, fieldState }) => (
              <IBaseSelect
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label="Customer Groups"
                selectedKeys={
                  field.value
                    ? new Set(
                        Array.isArray(field.value)
                          ? field.value
                          : [field.value],
                      )
                    : new Set()
                }
                selectionMode="multiple"
                size="sm"
                onSelectionChange={(keys) => {
                  const selectedArray = Array.from(keys);

                  field.onChange(
                    selectedArray.length > 0 ? selectedArray : undefined,
                  );
                }}
              >
                {customerGroupOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    textValue={
                      typeof option.label === "string"
                        ? option.label
                        : getLocalizedText(option.label)
                    }
                  >
                    {typeof option.label === "string"
                      ? option.label
                      : getLocalizedText(option.label)}
                  </SelectItem>
                ))}
              </IBaseSelect>
            )}
          />
        </div>
      </div>
    </div>
  );
}
