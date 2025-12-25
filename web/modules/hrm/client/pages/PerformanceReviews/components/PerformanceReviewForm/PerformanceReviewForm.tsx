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
import { Button } from "@base/client";
import { Card, CardBody, Textarea } from "@base/client";

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

  const validation = useMemo(() => createPerformanceReviewValidation(t), [t]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PerformanceReviewFormValues>({
    resolver: valibotResolver(validation.performanceReviewFormSchema) as any,
    defaultValues: {
      status: "draft",
      ...defaultValues,
    },
  });

  const onSubmitForm: SubmitHandler<PerformanceReviewFormValues> = async (
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
                <DatePicker
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.reviewDate")}
                  value={
                    field.value
                      ? typeof field.value === "string"
                        ? parseDate(field.value)
                        : field.value
                      : null
                  }
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
                  <Textarea
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
                  <Textarea
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
                  <Textarea
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
                  <Textarea
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
        </CardBody>
      </Card>
    </form>
  );
}
