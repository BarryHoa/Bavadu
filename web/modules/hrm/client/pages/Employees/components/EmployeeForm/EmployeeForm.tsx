"use client";

import { IBaseInput, IBaseInputMultipleLang, IBaseSingleSelectAsync } from "@base/client/components";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  Controller,
  useForm,
  type SubmitHandler,
} from "react-hook-form";

import { Button } from "@heroui/button";
import { Card, CardBody, Textarea } from "@heroui/react";
import type { EmployeeFormValues } from "../../validation/employeeValidation";
import { createEmployeeValidation } from "../../validation/employeeValidation";

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
          <Button size="sm" variant="light" onPress={onCancel}>
            {tLabels("cancel")}
          </Button>
        )}
        <Button
          color="primary"
          type="submit"
          size="sm"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {tLabels("save")}
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardBody className="p-4">
          <h2 className="text-base font-semibold mb-4">{tLabels("basicInfo")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="employeeCode"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={tLabels("employeeCode")}
                  size="sm"
                  isRequired
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="fullName"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputMultipleLang
                  label={tLabels("fullName")}
                  size="sm"
                  value={field.value || { vi: "", en: "" }}
                  onChange={field.onChange}
                  isRequired
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="firstName"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={tLabels("firstName")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="lastName"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={tLabels("lastName")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  type="email"
                  label={tLabels("email")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={tLabels("phone")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </div>
        </CardBody>
      </Card>

      {/* Employment Information */}
      <Card>
        <CardBody className="p-4">
          <h2 className="text-base font-semibold mb-4">{tLabels("employmentInfo")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="departmentId"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={tLabels("department")}
                  size="sm"
                  model="department.dropdown"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                  callWhen="mount"
                  isRequired
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="positionId"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={tLabels("position")}
                  size="sm"
                  model="position.dropdown"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                  callWhen="mount"
                  isRequired
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="managerId"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={tLabels("manager")}
                  size="sm"
                  model="employee.dropdown"
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
              name="hireDate"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  type="date"
                  label={tLabels("hireDate")}
                  size="sm"
                  isRequired
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="employmentStatus"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={tLabels("employmentStatus")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="baseSalary"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  type="number"
                  label={tLabels("baseSalary")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </div>
        </CardBody>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardBody className="p-4">
          <h2 className="text-base font-semibold mb-4">{tLabels("additionalInfo")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  type="date"
                  label={tLabels("dateOfBirth")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="gender"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={tLabels("gender")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </div>
        </CardBody>
      </Card>
    </form>
  );
}

