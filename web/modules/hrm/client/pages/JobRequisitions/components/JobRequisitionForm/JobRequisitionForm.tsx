"use client";

import {
  DatePicker,
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseInputNumber,
  IBaseSingleSelectAsync,
} from "@base/client/components";
import { Button } from "@heroui/button";
import { Card, CardBody, Textarea } from "@heroui/react";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { parseDate } from "@internationalized/date";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
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

  const validation = useMemo(() => createJobRequisitionValidation(t), [t]);

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
              name="requisitionNumber"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={t("labels.requisitionNumber")}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  isRequired
                />
              )}
            />
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputMultipleLang
                  label={t("labels.title")}
                  size="sm"
                  value={field.value as any}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  isRequired
                />
              )}
            />
            <Controller
              name="departmentId"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.department")}
                  model="hrm.department.dropdown"
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
                  label={t("labels.position")}
                  model="hrm.position.dropdown"
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
              name="numberOfOpenings"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.numberOfOpenings")}
                  size="sm"
                  value={field.value ?? 1}
                  onValueChange={(val) => field.onChange(val ?? 1)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={1}
                />
              )}
            />
            <Controller
              name="priority"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.priority")}
                  model="base-priority"
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
              name="employmentType"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.employmentType")}
                  model="base-employment-type"
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
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.status")}
                  model="base-job-requisition-status"
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
              name="minSalary"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.minSalary")}
                  size="sm"
                  value={field.value ?? null}
                  onValueChange={(val) => field.onChange(val ?? undefined)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={0}
                />
              )}
            />
            <Controller
              name="maxSalary"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.maxSalary")}
                  size="sm"
                  value={field.value ?? null}
                  onValueChange={(val) => field.onChange(val ?? undefined)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={0}
                />
              )}
            />
            <Controller
              name="currency"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.currency")}
                  model="base-currency"
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
              name="openedDate"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker
                  label={t("labels.openedDate")}
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
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="closedDate"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker
                  label={t("labels.closedDate")}
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
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="hiringManagerId"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.hiringManager")}
                  model="hrm.employee.dropdown"
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
              name="recruiterId"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.recruiter")}
                  model="hrm.employee.dropdown"
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
              name="requirements"
              control={control}
              render={({ field, fieldState }) => (
                <div className="md:col-span-2">
                  <Textarea
                    {...field}
                    label={t("labels.requirements")}
                    size="sm"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    isInvalid={fieldState.invalid}
                    errorMessage={fieldState.error?.message}
                  />
                </div>
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
