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
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Basic Information</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <IBaseInputMultipleLang
                label="Name"
                size="sm"
                value={field.value}
                onValueChange={field.onChange}
                isRequired
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field, fieldState }) => (
              <IBaseInput
                label="Code"
                size="sm"
                value={field.value}
                onChange={field.onChange}
                isRequired
                isDisabled={isEdit}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="type"
            control={control}
            render={({ field, fieldState }) => (
              <IBaseSingleSelect
                label="Type"
                size="sm"
                items={typeOptions}
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
        <div className="mt-4">
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <Textarea
                label="Description"
                size="sm"
                value={field.value || ""}
                onValueChange={field.onChange}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
                minRows={2}
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
            name="status"
            control={control}
            render={({ field, fieldState }) => (
              <IBaseSingleSelect
                label="Status"
                size="sm"
                items={statusOptions}
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
          <Controller
            name="priority"
            control={control}
            render={({ field, fieldState }) => (
              <IBaseInputNumber
                label="Priority"
                size="sm"
                value={field.value ? Number(field.value) : 0}
                onValueChange={(value) => field.onChange(value?.toString() || "0")}
                min={0}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <div className="flex items-end">
            <Controller
              name="isDefault"
              control={control}
              render={({ field }) => (
                <Checkbox
                  size="sm"
                  isSelected={field.value === "true" || field.value === true}
                  onValueChange={(checked) => field.onChange(checked ? "true" : "false")}
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
            name="validFrom"
            control={control}
            render={({ field, fieldState }) => (
              <IBaseInput
                label="Valid From"
                size="sm"
                type="date"
                value={field.value}
                onChange={field.onChange}
                isRequired
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="validTo"
            control={control}
            render={({ field, fieldState }) => (
              <IBaseInput
                label="Valid To (leave empty for forever - standard only)"
                size="sm"
                type="date"
                value={field.value}
                onChange={field.onChange}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <div></div>
        </div>
      </div>

      {/* Applicable To */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Applicable To</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Controller
            name="applicableTo.channels"
            control={control}
            render={({ field, fieldState }) => (
              <IBaseSelect
                label="Channels"
                size="sm"
                selectionMode="multiple"
                selectedKeys={field.value ? new Set(Array.isArray(field.value) ? field.value : [field.value]) : new Set()}
                onSelectionChange={(keys) => {
                  const selectedArray = Array.from(keys);
                  field.onChange(selectedArray.length > 0 ? selectedArray : undefined);
                }}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              >
                {channelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </IBaseSelect>
            )}
          />
          <Controller
            name="applicableTo.stores"
            control={control}
            render={({ field, fieldState }) => (
              <IBaseSelect
                label="Stores"
                size="sm"
                selectionMode="multiple"
                selectedKeys={field.value ? new Set(Array.isArray(field.value) ? field.value : [field.value]) : new Set()}
                onSelectionChange={(keys) => {
                  const selectedArray = Array.from(keys);
                  field.onChange(selectedArray.length > 0 ? selectedArray : undefined);
                }}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              >
                {storeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </IBaseSelect>
            )}
          />
          <Controller
            name="applicableTo.locations"
            control={control}
            render={({ field, fieldState }) => (
              <IBaseSelect
                label="Locations"
                size="sm"
                selectionMode="multiple"
                selectedKeys={field.value ? new Set(Array.isArray(field.value) ? field.value : [field.value]) : new Set()}
                onSelectionChange={(keys) => {
                  const selectedArray = Array.from(keys);
                  field.onChange(selectedArray.length > 0 ? selectedArray : undefined);
                }}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              >
                {locationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </IBaseSelect>
            )}
          />
          <Controller
            name="applicableTo.regions"
            control={control}
            render={({ field, fieldState }) => (
              <IBaseSelect
                label="Regions"
                size="sm"
                selectionMode="multiple"
                selectedKeys={field.value ? new Set(Array.isArray(field.value) ? field.value : [field.value]) : new Set()}
                onSelectionChange={(keys) => {
                  const selectedArray = Array.from(keys);
                  field.onChange(selectedArray.length > 0 ? selectedArray : undefined);
                }}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              >
                {regionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </IBaseSelect>
            )}
          />
          <Controller
            name="applicableTo.customerGroups"
            control={control}
            render={({ field, fieldState }) => (
              <IBaseSelect
                label="Customer Groups"
                size="sm"
                selectionMode="multiple"
                selectedKeys={field.value ? new Set(Array.isArray(field.value) ? field.value : [field.value]) : new Set()}
                onSelectionChange={(keys) => {
                  const selectedArray = Array.from(keys);
                  field.onChange(selectedArray.length > 0 ? selectedArray : undefined);
                }}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              >
                {customerGroupOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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

