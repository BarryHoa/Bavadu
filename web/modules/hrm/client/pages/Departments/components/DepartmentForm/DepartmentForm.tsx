"use client";

import type { DepartmentFormValues } from "../../validation/departmentValidation";

import { IBaseButton, IBaseCard, IBaseCardBody } from "@base/client";
import {
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseSingleSelectAsync,
} from "@base/client/components";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import { createDepartmentValidation } from "../../validation/departmentValidation";

export type { DepartmentFormValues };

interface DepartmentFormProps {
  onSubmit: (values: DepartmentFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<DepartmentFormValues>;
}

export default function DepartmentForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
}: DepartmentFormProps) {
  const t = useTranslations("hrm.department.create.validation");
  const tLabels = useTranslations("hrm.department.create.labels");

  // React Compiler will automatically optimize this computation
  const validation = createDepartmentValidation(t);

  const { control, handleSubmit } = useForm<DepartmentFormValues>({
    resolver: valibotResolver(validation.departmentFormSchema) as any,
    defaultValues: {
      isActive: true,
      ...defaultValues,
    },
  });

  const onSubmitForm: SubmitHandler<DepartmentFormValues> = async (values) => {
    await onSubmit(values);
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmitForm)}>
      <div className="sticky top-0 z-10 flex justify-end gap-3 py-2 mb-3 bg-background border-b border-divider -mx-4 px-4">
        {onCancel && (
          <IBaseButton size="sm" variant="light" onPress={onCancel}>
            {tLabels("cancel")}
          </IBaseButton>
        )}
        <IBaseButton
          color="primary"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          size="sm"
          type="submit"
        >
          {tLabels("save")}
        </IBaseButton>
      </div>

      <IBaseCard>
        <IBaseCardBody className="p-4">
          <h2 className="text-base font-semibold mb-4">
            {tLabels("basicInfo")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="code"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("code")}
                  size="sm"
                />
              )}
            />

            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <IBaseInputMultipleLang
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("name")}
                  size="sm"
                  value={field.value || { vi: "", en: "" }}
                  onValueChange={field.onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="parentId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("parentDepartment")}
                  model="department.dropdown"
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
              name="level"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("level")}
                  size="sm"
                  type="number"
                />
              )}
            />

            <Controller
              control={control}
              name="managerId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("manager")}
                  model="employee.dropdown"
                  selectedKey={field.value}
                  size="sm"
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </form>
  );
}
