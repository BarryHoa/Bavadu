"use client";

import {
  DatePicker,
  IBaseInputNumber,
  IBaseSingleSelectAsync,
} from "@base/client/components";
import { Button } from "@heroui/button";
import { Card, CardBody, Textarea } from "@heroui/react";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { parseDate } from "@internationalized/date";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import {
  createLeaveRequestValidation,
  type LeaveRequestFormValues,
} from "../../validation/leaveRequestValidation";

export type { LeaveRequestFormValues };

interface LeaveRequestFormProps {
  onSubmit: (values: LeaveRequestFormValues) => Promise<void>;
  onCancel?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
  defaultValues?: Partial<LeaveRequestFormValues>;
}

export default function LeaveRequestForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
}: LeaveRequestFormProps) {
  const t = useTranslations("hrm.leaveRequests");
  const tCommon = useTranslations("common");

  const validation = useMemo(() => createLeaveRequestValidation(t), [t]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeaveRequestFormValues>({
    resolver: valibotResolver(validation.leaveRequestFormSchema) as any,
    defaultValues: {
      status: "pending",
      days: 1,
      ...defaultValues,
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const calculateDays = useCallback(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 0) {
        setValue("days", diffDays);
      }
    }
  }, [startDate, endDate, setValue]);

  const onSubmitForm: SubmitHandler<LeaveRequestFormValues> = async (
    values,
  ) => {
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
          disabled={isSubmitting}
          isLoading={isSubmitting}
          size="sm"
          type="submit"
        >
          {tCommon("actions.save")}
        </Button>
      </div>

      <Card>
        <CardBody className="p-4">
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
              name="leaveTypeId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  isRequired
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.leaveType")}
                  model="hrm.leave-type.dropdown"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="startDate"
              render={({ field, fieldState }) => (
                <DatePicker
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.startDate")}
                  value={
                    field.value
                      ? typeof field.value === "string"
                        ? parseDate(field.value)
                        : field.value
                      : null
                  }
                  onChange={(val) => {
                    field.onChange(val ? val.toString() : null);
                    calculateDays();
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="endDate"
              render={({ field, fieldState }) => (
                <DatePicker
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.endDate")}
                  value={
                    field.value
                      ? typeof field.value === "string"
                        ? parseDate(field.value)
                        : field.value
                      : null
                  }
                  onChange={(val) => {
                    field.onChange(val ? val.toString() : null);
                    calculateDays();
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="days"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  readOnly
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.days")}
                  min={1}
                  size="sm"
                  value={field.value}
                  onValueChange={(val) => field.onChange(val ?? 1)}
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
                  model="base-leave-request-status"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="reason"
              render={({ field, fieldState }) => (
                <div className="md:col-span-2">
                  <Textarea
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={t("labels.reason")}
                    size="sm"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
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
