"use client";

import {
  IBaseInput,
  IBaseInputNumber,
  IBaseSingleSelectAsync,
  DatePicker,
} from "@base/client/components";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { parseDate } from "@internationalized/date";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@heroui/button";
import { Card, CardBody, Textarea } from "@heroui/react";
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

  const validation = useMemo(() => createTimesheetValidation(t), [t]);

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
          <Button size="sm" variant="light" onPress={onCancel}>
            {tCommon("actions.cancel")}
          </Button>
        )}
        <Button
          color="primary"
          type="submit"
          size="sm"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {tCommon("actions.save")}
        </Button>
      </div>

      <Card>
        <CardBody className="p-4">
          <h2 className="text-base font-semibold mb-2">{t("generalInfo")}</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <Controller
              name="employeeId"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.employee")}
                  model="hrm.employee.dropdown"
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
              name="workDate"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker
                  label={t("labels.workDate")}
                  value={field.value ? (typeof field.value === "string" ? parseDate(field.value) : field.value) : null}
                  onChange={(val) => field.onChange(val ? val.toString() : null)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  isRequired
                />
              )}
            />
            <Controller
              name="shiftId"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.shift")}
                  model="hrm.shift.dropdown"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                  callWhen="mount"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="checkInTime"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={t("labels.checkInTime")}
                  size="sm"
                  type="datetime-local"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="checkOutTime"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={t("labels.checkOutTime")}
                  size="sm"
                  type="datetime-local"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="breakDuration"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.breakDuration")}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={0}
                />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.status")}
                  model="base-timesheet-status"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                  callWhen="mount"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="checkInMethod"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.checkInMethod")}
                  model="base-check-method"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                  callWhen="mount"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="checkInLocation"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={t("labels.checkInLocation")}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="checkOutLocation"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={t("labels.checkOutLocation")}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="notes"
              control={control}
              render={({ field, fieldState }) => (
                <div className="md:col-span-2">
                  <Textarea
                    {...field}
                    label={t("labels.notes")}
                    size="sm"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    isInvalid={fieldState.invalid}
                    errorMessage={fieldState.error?.message}
                  />
                </div>
              )}
            />
          </div>
        </CardBody>
      </Card>
    </form>
  );
}

