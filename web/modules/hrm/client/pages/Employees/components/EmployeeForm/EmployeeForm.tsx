"use client";

import type { EmployeeFormValues } from "../../validation/employeeValidation";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import React from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import {
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseSingleSelectAsync,
} from "@base/client/components";
import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
} from "@base/client";

import { createEmployeeValidation } from "../../validation/employeeValidation";

export type { EmployeeFormValues };

interface EmployeeFormProps {
  onSubmit: (values: EmployeeFormValues) => Promise<void>;
  onCancel?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
  defaultValues?: Partial<EmployeeFormValues>;
  mode?: "create" | "edit";
}

export default function EmployeeForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
  mode = "create",
}: EmployeeFormProps) {
  const t = useTranslations("hrm.employee.create.validation");
  const tLabels = useTranslations("hrm.employee.create.labels");

  // React Compiler will automatically optimize this computation
  const validation = createEmployeeValidation(t);

  const { control, handleSubmit } = useForm<EmployeeFormValues>({
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
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmitForm)}>
      {submitError ? (
        <div
          aria-live="polite"
          className="rounded-xl border-2 border-danger-300 bg-danger-50 px-4 py-3 text-sm font-semibold text-danger-700 shadow-sm"
        >
          {submitError}
        </div>
      ) : null}

      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {tLabels("basicInfo")}
            </h2>
          </div>
          <div className="flex flex-col gap-8">
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
            </div>
            <div className="grid gap-4 md:grid-cols-2">
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
            </div>
            <div className="grid gap-4 md:grid-cols-2">
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
          </div>
        </IBaseCardBody>
      </IBaseCard>

      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {tLabels("employmentInfo")}
            </h2>
          </div>
          <div className="flex flex-col gap-8">
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
            </div>
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
            <div className="grid gap-4 md:grid-cols-2">
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
            </div>
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

      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {tLabels("additionalInfo")}
            </h2>
          </div>
          <div className="flex flex-col gap-8">
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
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-default-200">
            <IBaseButton
              color="primary"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              size="md"
              type="submit"
            >
              {mode === "create"
                ? tLabels("saveCreate")
                : tLabels("saveUpdate")}
            </IBaseButton>
            {onCancel && (
              <IBaseButton size="md" variant="light" onPress={onCancel}>
                {tLabels("cancel")}
              </IBaseButton>
            )}
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </form>
  );
}
