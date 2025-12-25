"use client";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseInputNumber,
  IBaseSingleSelectAsync,
  IBaseTextarea,
} from "@base/client/components";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import {
  createPayrollValidation,
  type PayrollFormValues,
} from "../../validation/payrollValidation";

export type { PayrollFormValues };

interface PayrollFormProps {
  onSubmit: (values: PayrollFormValues) => Promise<void>;
  onCancel?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
  defaultValues?: Partial<PayrollFormValues>;
}

export default function PayrollForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
}: PayrollFormProps) {
  const t = useTranslations("hrm.payroll");
  const tCommon = useTranslations("common");

  const validation = useMemo(() => createPayrollValidation(t), [t]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PayrollFormValues>({
    resolver: valibotResolver(validation.payrollFormSchema) as any,
    defaultValues: {
      status: "draft",
      overtimePay: 0,
      bonuses: 0,
      otherEarnings: 0,
      socialInsurance: 0,
      healthInsurance: 0,
      unemploymentInsurance: 0,
      personalIncomeTax: 0,
      workingDays: 0,
      workingHours: 0,
      overtimeHours: 0,
      ...defaultValues,
    },
  });

  const onSubmitForm: SubmitHandler<PayrollFormValues> = async (values) => {
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
              name="payrollPeriodId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  isRequired
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.payrollPeriod")}
                  model="hrm.payroll-period.dropdown"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
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
              name="baseSalary"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.baseSalary")}
                  min={0}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                />
              )}
            />
            <Controller
              control={control}
              name="overtimePay"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.overtimePay")}
                  min={0}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                />
              )}
            />
            <Controller
              control={control}
              name="bonuses"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.bonuses")}
                  min={0}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                />
              )}
            />
            <Controller
              control={control}
              name="otherEarnings"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.otherEarnings")}
                  min={0}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                />
              )}
            />
            <Controller
              control={control}
              name="socialInsurance"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.socialInsurance")}
                  min={0}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                />
              )}
            />
            <Controller
              control={control}
              name="healthInsurance"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.healthInsurance")}
                  min={0}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                />
              )}
            />
            <Controller
              control={control}
              name="unemploymentInsurance"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.unemploymentInsurance")}
                  min={0}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                />
              )}
            />
            <Controller
              control={control}
              name="personalIncomeTax"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.personalIncomeTax")}
                  min={0}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                />
              )}
            />
            <Controller
              control={control}
              name="workingDays"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.workingDays")}
                  min={0}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                />
              )}
            />
            <Controller
              control={control}
              name="workingHours"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.workingHours")}
                  min={0}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                />
              )}
            />
            <Controller
              control={control}
              name="overtimeHours"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.overtimeHours")}
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
                  model="base-payroll-status"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
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
