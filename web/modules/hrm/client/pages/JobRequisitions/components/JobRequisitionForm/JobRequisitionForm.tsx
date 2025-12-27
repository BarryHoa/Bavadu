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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JobRequisitionFormValues>({
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
        </IBaseCardBody>
      </IBaseCard>
    </form>
  );
}
