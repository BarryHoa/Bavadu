"use client";

import type { EmployeeFormValues } from "../../validation/employeeValidation";

import {
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseSingleSelectAsync,
} from "@base/client/components";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { IBaseButton } from "@base/client";
import { IBaseCard, IBaseCardBody } from "@base/client";

import { createEmployeeValidation } from "../../validation/employeeValidation";

export type { EmployeeFormValues };

interface EmployeeFormProps {
  onSubmit: (values: EmployeeFormValues) => Promise<void>;
  onCancel?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
  defaultValues?: Partial<EmployeeFormValues>;
}

export default function EmployeeForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
}: EmployeeFormProps) {
  const t = useTranslations("hrm.employee.create.validation");
  const tLabels = useTranslations("hrm.employee.create.labels");

  // Create validation schemas with translation
  const validation = useMemo(() => createEmployeeValidation(t), [t]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: valibotResolver(validation.employeeFormSchema) as any,
    defaultValues: {
      isActive: true,
      employmentStatus: "active",
      currency: "VND",
      ...defaultValues,
    },
  });

  const onSubmitForm: SubmitHandler<EmployeeFormValues> = async (values) => {
    await onSubmit(values);
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmitForm)}>
      {submitError ? (
        <div className="mb-3 rounded-large border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-600">
          {submitError}
        </div>
      ) : null}

      {/* Action Buttons - Sticky */}
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

      {/* Basic Information */}
      <IBaseCard>
        <IBaseCardBody className="p-4">
          <h2 className="text-base font-semibold mb-4">
            {tLabels("basicInfo")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="employeeCode"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("employeeCode")}
                  size="sm"
                />
              )}
            />

            <Controller
              control={control}
              name="fullName"
              render={({ field, fieldState }) => (
                <IBaseInputMultipleLang
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("fullName")}
                  size="sm"
                  value={field.value || { vi: "", en: "" }}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="firstName"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("firstName")}
                  size="sm"
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("lastName")}
                  size="sm"
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("email")}
                  size="sm"
                  type="email"
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("phone")}
                  size="sm"
                />
              )}
            />
          </div>
        </IBaseCardBody>
      </IBaseCard>

      {/* Employment Information */}
      <IBaseCard>
        <IBaseCardBody className="p-4">
          <h2 className="text-base font-semibold mb-4">
            {tLabels("employmentInfo")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="departmentId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  isRequired
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("department")}
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
              name="positionId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  isRequired
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("position")}
                  model="position.dropdown"
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

            <Controller
              control={control}
              name="hireDate"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("hireDate")}
                  size="sm"
                  type="date"
                />
              )}
            />

            <Controller
              control={control}
              name="employmentStatus"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("employmentStatus")}
                  size="sm"
                />
              )}
            />

            <Controller
              control={control}
              name="baseSalary"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("baseSalary")}
                  size="sm"
                  type="number"
                />
              )}
            />
          </div>
        </IBaseCardBody>
      </IBaseCard>

      {/* Additional Information */}
      <IBaseCard>
        <IBaseCardBody className="p-4">
          <h2 className="text-base font-semibold mb-4">
            {tLabels("additionalInfo")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("dateOfBirth")}
                  size="sm"
                  type="date"
                />
              )}
            />

            <Controller
              control={control}
              name="gender"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("gender")}
                  size="sm"
                />
              )}
            />
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </form>
  );
}
