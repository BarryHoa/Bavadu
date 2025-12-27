"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import React from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseTextarea,
  toDayjs,
} from "@base/client";
import {
  IBaseDatePicker,
  IBaseInput,
  IBaseInputNumber,
  IBaseSingleSelectAsync,
} from "@base/client/components";

import {
  createTimesheetValidation,
  type TimesheetFormValues,
} from "../../validation/timesheetValidation";

export type { TimesheetFormValues };

interface TimesheetFormProps {
  onSubmit: (values: TimesheetFormValues) => Promise<void>;
  onCancel?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
  defaultValues?: Partial<TimesheetFormValues>;
}

export default function TimesheetForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
}: TimesheetFormProps) {
  const t = useTranslations("hrm.timesheets");
  const tCommon = useTranslations("common");

  // React Compiler will automatically optimize this computation
  const validation = createTimesheetValidation(t);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TimesheetFormValues>({
    resolver: valibotResolver(validation.timesheetFormSchema) as any,
    defaultValues: {
      status: "pending",
      breakDuration: 0,
      ...defaultValues,
    },
  });

  const onSubmitForm: SubmitHandler<TimesheetFormValues> = async (values) => {
    await onSubmit(values);
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmitForm)}>
      {submitError ? (
        <div className="mb-3 rounded-large border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-600">
          {submitError}
        </div>
      ) : null}

      <div className="sticky top-0 z-10 flex justify-end gap-3 py-2 mb-3 bg-background border-b border-divider -mx-4 px-4">
        {onCancel && (
          <IBaseButton size="sm" variant="light" onPress={onCancel}>
            {tCommon("actions.cancel")}
          </IBaseButton>
        )}
        <IBaseButton
          color="primary"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          size="sm"
          type="submit"
        >
          {tCommon("actions.save")}
        </IBaseButton>
      </div>

      <IBaseCard>
        <IBaseCardBody className="p-4">
          <h2 className="text-base font-semibold mb-2">{t("generalInfo")}</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <Controller
              control={control}
              name="employeeId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  isRequired
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.employee")}
                  model="hrm.employee.dropdown"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="workDate"
              render={({ field, fieldState }) => (
                <IBaseDatePicker
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.workDate")}
                  value={field.value ? toDayjs(field.value) : undefined}
                  onChange={(val) =>
                    field.onChange(val ? val.toString() : null)
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="shiftId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.shift")}
                  model="hrm.shift.dropdown"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="checkInTime"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.checkInTime")}
                  size="sm"
                  type="datetime-local"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="checkOutTime"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.checkOutTime")}
                  size="sm"
                  type="datetime-local"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="breakDuration"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.breakDuration")}
                  min={0}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                />
              )}
            />
            <Controller
              control={control}
              name="status"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.status")}
                  model="base-timesheet-status"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="checkInMethod"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.checkInMethod")}
                  model="base-check-method"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="checkInLocation"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.checkInLocation")}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="checkOutLocation"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.checkOutLocation")}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="notes"
              render={({ field, fieldState }) => (
                <div className="md:col-span-2">
                  <IBaseTextarea
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={t("labels.notes")}
                    size="sm"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </form>
  );
}
