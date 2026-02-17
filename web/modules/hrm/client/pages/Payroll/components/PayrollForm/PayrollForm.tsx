"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import React from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import { IBaseCard, IBaseCardBody, IBaseTextarea } from "@base/client";
import { IBaseButton } from "@base/client";
import {
  IBaseInputNumber,
  IBaseSingleSelectAsync,
} from "@base/client/components";

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

  // React Compiler will automatically optimize this computation
  const validation = createPayrollValidation(t);

  const { control, handleSubmit } = useForm<PayrollFormValues>({
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
