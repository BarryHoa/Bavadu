"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
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
  IBaseDatePickerValue,
  IBaseInputNumber,
  IBaseSingleSelectAsync,
} from "@base/client/components";

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
  /** Designlab #16: Use descriptive, action-based button text */
  mode?: "create" | "edit";
}

export default function LeaveRequestForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
  mode = "create",
}: LeaveRequestFormProps) {
  const t = useTranslations("hrm.leaveRequests");
  const tLabels = useTranslations("hrm.leaveRequests.labels");

  const validation = createLeaveRequestValidation(t);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
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
    <form
      className="flex max-w-[45rem] flex-col gap-6"
      onSubmit={handleSubmit(onSubmitForm)}
    >
      {/* NN/G: Highly visible error - outline + red + font weight */}
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
              {t("generalInfo")}
            </h2>
          </div>

          {/* NN/G: Single-column layout; Start+End date related → 2 cols on desktop */}
          <div className="flex flex-col gap-8">
            <Controller
              control={control}
              name="employeeId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  isRequired
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("employee")}
                  model="hrm.employee.dropdown"
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
              name="leaveTypeId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  isRequired
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("leaveType")}
                  model="hrm.leave-type.dropdown"
                  selectedKey={field.value}
                  size="sm"
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />

            {/* Start + End date: related fields → 2 cols (doc 3.2) */}
            <div className="grid gap-8 md:grid-cols-2">
              <Controller
                control={control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <IBaseDatePicker
                    isRequired
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={tLabels("startDate")}
                    size="sm"
                    value={
                      field.value
                        ? toDayjs(field.value)
                        : (undefined as unknown as IBaseDatePickerValue)
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
                  <IBaseDatePicker
                    isRequired
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={tLabels("endDate")}
                    size="sm"
                    value={
                      field.value
                        ? toDayjs(field.value)
                        : (undefined as unknown as IBaseDatePickerValue)
                    }
                    onChange={(val) => {
                      field.onChange(val ? val.toString() : null);
                      calculateDays();
                    }}
                  />
                )}
              />
            </div>

            <Controller
              control={control}
              name="days"
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1">
                  <IBaseInputNumber
                    {...field}
                    readOnly
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={tLabels("days")}
                    min={1}
                    size="sm"
                    value={field.value}
                    onValueChange={(val) => field.onChange(val ?? 1)}
                  />
                  <p className="text-xs text-default-500">
                    {tLabels("daysHelper")}
                  </p>
                </div>
              )}
            />

            {mode === "edit" ? (
              <Controller
                control={control}
                name="status"
                render={({ field, fieldState }) => (
                  <IBaseSingleSelectAsync
                    callWhen="mount"
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={tLabels("status")}
                    model="base-leave-request-status"
                    selectedKey={field.value}
                    size="sm"
                    onSelectionChange={(key) => {
                      field.onChange(key || undefined);
                    }}
                  />
                )}
              />
            ) : null}

            <Controller
              control={control}
              name="reason"
              render={({ field, fieldState }) => (
                <IBaseTextarea
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("reason")}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Designlab #16: Descriptive buttons; Full-page: primary left, cancel right */}
          <div className="flex flex-wrap items-center gap-3 border-t border-default-200 pt-6">
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
