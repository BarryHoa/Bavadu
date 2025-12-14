"use client";

import {
  IBaseInputNumber,
  IBaseSingleSelectAsync,
} from "@base/client/components";
import { Button } from "@heroui/button";
import { Card, CardBody, Textarea } from "@heroui/react";
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
              name="payrollPeriodId"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.payrollPeriod")}
                  model="hrm.payroll-period.dropdown"
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
              name="baseSalary"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.baseSalary")}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={0}
                  isRequired
                />
              )}
            />
            <Controller
              name="overtimePay"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.overtimePay")}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={0}
                />
              )}
            />
            <Controller
              name="bonuses"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.bonuses")}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={0}
                />
              )}
            />
            <Controller
              name="otherEarnings"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.otherEarnings")}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={0}
                />
              )}
            />
            <Controller
              name="socialInsurance"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.socialInsurance")}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={0}
                />
              )}
            />
            <Controller
              name="healthInsurance"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.healthInsurance")}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={0}
                />
              )}
            />
            <Controller
              name="unemploymentInsurance"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.unemploymentInsurance")}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={0}
                />
              )}
            />
            <Controller
              name="personalIncomeTax"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.personalIncomeTax")}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={0}
                />
              )}
            />
            <Controller
              name="workingDays"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.workingDays")}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={0}
                />
              )}
            />
            <Controller
              name="workingHours"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.workingHours")}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={0}
                />
              )}
            />
            <Controller
              name="overtimeHours"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.overtimeHours")}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : 0}
                  onValueChange={(val) => field.onChange(val ?? 0)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={0}
                />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.status")}
                  model="base-payroll-status"
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
