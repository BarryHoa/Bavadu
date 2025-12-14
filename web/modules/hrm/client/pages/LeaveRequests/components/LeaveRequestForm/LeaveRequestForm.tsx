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
    values
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
              name="leaveTypeId"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.leaveType")}
                  model="hrm.leave-type.dropdown"
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
              name="startDate"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker
                  label={t("labels.startDate")}
                  value={field.value ? (typeof field.value === "string" ? parseDate(field.value) : field.value) : null}
                  onChange={(val) => {
                    field.onChange(val ? val.toString() : null);
                    calculateDays();
                  }}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  isRequired
                />
              )}
            />
            <Controller
              name="endDate"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker
                  label={t("labels.endDate")}
                  value={field.value ? (typeof field.value === "string" ? parseDate(field.value) : field.value) : null}
                  onChange={(val) => {
                    field.onChange(val ? val.toString() : null);
                    calculateDays();
                  }}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  isRequired
                />
              )}
            />
            <Controller
              name="days"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.days")}
                  size="sm"
                  value={field.value}
                  onValueChange={(val) => field.onChange(val ?? 1)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={1}
                  readOnly
                />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.status")}
                  model="base-leave-request-status"
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
              name="reason"
              control={control}
              render={({ field, fieldState }) => (
                <div className="md:col-span-2">
                  <Textarea
                    {...field}
                    label={t("labels.reason")}
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
