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
  createPerformanceReviewValidation,
  type PerformanceReviewFormValues,
} from "../../validation/performanceReviewValidation";

export type { PerformanceReviewFormValues };

interface PerformanceReviewFormProps {
  onSubmit: (values: PerformanceReviewFormValues) => Promise<void>;
  onCancel?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
  defaultValues?: Partial<PerformanceReviewFormValues>;
}

export default function PerformanceReviewForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
}: PerformanceReviewFormProps) {
  const t = useTranslations("hrm.performanceReviews");
  const tCommon = useTranslations("common");

  // React Compiler will automatically optimize this computation
  const validation = createPerformanceReviewValidation(t);

  const { control, handleSubmit } = useForm<PerformanceReviewFormValues>({
    resolver: valibotResolver(validation.performanceReviewFormSchema) as any,
    defaultValues: {
      status: "draft",
      ...defaultValues,
    },
  });

  const onSubmitForm: SubmitHandler<PerformanceReviewFormValues> = async (
    values
  ) => {
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
              {t("generalInfo")}
            </h2>
          </div>
          <div className="flex flex-col gap-8">
          <div className="grid gap-4 md:grid-cols-2">
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
              name="reviewType"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  isRequired
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.reviewType")}
                  model="base-review-type"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="reviewPeriod"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.reviewPeriod")}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="reviewDate"
              render={({ field, fieldState }) => (
                <IBaseDatePicker
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.reviewDate")}
                  value={field.value ? toDayjs(field.value) : undefined}
                  onChange={(val) =>
                    field.onChange(val ? val.toString() : null)
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="reviewerId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  isRequired
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.reviewer")}
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
              name="overallRating"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.overallRating")}
                  max={5}
                  min={1}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : null}
                  onValueChange={(val) => field.onChange(val ?? null)}
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
                  model="base-performance-review-status"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="strengths"
              render={({ field, fieldState }) => (
                <div className="md:col-span-2">
                  <IBaseTextarea
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={t("labels.strengths")}
                    size="sm"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="areasForImprovement"
              render={({ field, fieldState }) => (
                <div className="md:col-span-2">
                  <IBaseTextarea
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={t("labels.areasForImprovement")}
                    size="sm"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="feedback"
              render={({ field, fieldState }) => (
                <div className="md:col-span-2">
                  <IBaseTextarea
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={t("labels.feedback")}
                    size="sm"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="employeeComments"
              render={({ field, fieldState }) => (
                <div className="md:col-span-2">
                  <IBaseTextarea
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={t("labels.employeeComments")}
                    size="sm"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  />
                </div>
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
              {tCommon("actions.save")}
            </IBaseButton>
            {onCancel && (
              <IBaseButton size="md" variant="light" onPress={onCancel}>
                {tCommon("actions.cancel")}
              </IBaseButton>
            )}
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </form>
  );
}
