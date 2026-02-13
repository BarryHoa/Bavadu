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
  IBaseDatePickerValue,
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseInputNumber,
  IBaseSingleSelectAsync,
} from "@base/client/components";

import {
  createJobRequisitionValidation,
  type JobRequisitionFormValues,
} from "../../validation/jobRequisitionValidation";

export type { JobRequisitionFormValues };

interface JobRequisitionFormProps {
  onSubmit: (values: JobRequisitionFormValues) => Promise<void>;
  onCancel?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
  defaultValues?: Partial<JobRequisitionFormValues>;
}

export default function JobRequisitionForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
}: JobRequisitionFormProps) {
  const t = useTranslations("hrm.jobRequisitions");
  const tCommon = useTranslations("common");

  // React Compiler will automatically optimize this computation
  const validation = createJobRequisitionValidation(t);

  const { control, handleSubmit } = useForm<JobRequisitionFormValues>({
    resolver: valibotResolver(validation.jobRequisitionFormSchema) as any,
    defaultValues: {
      status: "draft",
      priority: "normal",
      currency: "VND",
      numberOfOpenings: 1,
      ...defaultValues,
    },
  });

  const onSubmitForm: SubmitHandler<JobRequisitionFormValues> = async (
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
              name="requisitionNumber"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.requisitionNumber")}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="title"
              render={({ field, fieldState }) => (
                <IBaseInputMultipleLang
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.title")}
                  size="sm"
                  value={field.value as any}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="departmentId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  isRequired
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.department")}
                  model="hrm.department.dropdown"
                  selectedKey={field.value}
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
                  label={t("labels.position")}
                  model="hrm.position.dropdown"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="numberOfOpenings"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.numberOfOpenings")}
                  min={1}
                  size="sm"
                  value={field.value ?? 1}
                  onValueChange={(val) => field.onChange(val ?? 1)}
                />
              )}
            />
            <Controller
              control={control}
              name="priority"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.priority")}
                  model="base-priority"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="employmentType"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.employmentType")}
                  model="base-employment-type"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
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
                  model="base-job-requisition-status"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="minSalary"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.minSalary")}
                  min={0}
                  size="sm"
                  value={field.value ?? null}
                  onValueChange={(val) => field.onChange(val ?? undefined)}
                />
              )}
            />
            <Controller
              control={control}
              name="maxSalary"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.maxSalary")}
                  min={0}
                  size="sm"
                  value={field.value ?? null}
                  onValueChange={(val) => field.onChange(val ?? undefined)}
                />
              )}
            />
            <Controller
              control={control}
              name="currency"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.currency")}
                  model="base-currency"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="openedDate"
              render={({ field, fieldState }) => (
                <IBaseDatePicker
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.openedDate")}
                  value={
                    field.value
                      ? toDayjs(field.value)
                      : (undefined as unknown as IBaseDatePickerValue)
                  }
                  onChange={(val) =>
                    field.onChange(val ? val.toString() : null)
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="closedDate"
              render={({ field, fieldState }) => (
                <IBaseDatePicker
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.closedDate")}
                  value={
                    field.value
                      ? (toDayjs(
                          field.value
                        ) as unknown as IBaseDatePickerValue)
                      : undefined
                  }
                  onChange={(val) =>
                    field.onChange(val ? val.toString() : null)
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="hiringManagerId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.hiringManager")}
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
              name="recruiterId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.recruiter")}
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
              name="requirements"
              render={({ field, fieldState }) => (
                <div className="md:col-span-2">
                  <IBaseTextarea
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={t("labels.requirements")}
                    size="sm"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  />
                </div>
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
