"use client";

import type { ContractFormValues } from "../../validation/contractValidation";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import React from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import { IBaseCard, IBaseCardBody, IBaseTextarea } from "@base/client";
import { IBaseButton } from "@base/client";
import { IBaseInput, IBaseSingleSelectAsync } from "@base/client/components";

import { createContractValidation } from "../../validation/contractValidation";

export type { ContractFormValues };

interface ContractFormProps {
  onSubmit: (values: ContractFormValues) => Promise<void>;
  onCancel?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
  defaultValues?: Partial<ContractFormValues>;
  mode?: "create" | "edit";
}

export default function ContractForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
  mode = "create",
}: ContractFormProps) {
  const t = useTranslations("hrm.contract.create.validation");
  const tLabels = useTranslations("hrm.contract.create.labels");

  // React Compiler will automatically optimize this computation
  const validation = createContractValidation(t);

  const { control, handleSubmit } = useForm<ContractFormValues>({
    resolver: valibotResolver(validation.contractFormSchema) as any,
    defaultValues: {
      isActive: true,
      status: "draft",
      currency: "VND",
      ...defaultValues,
    },
  });

  const onSubmitForm: SubmitHandler<ContractFormValues> = async (values) => {
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
              {tLabels("basicInfo")}
            </h2>
          </div>
          <div className="flex flex-col gap-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="contractNumber"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("contractNumber")}
                  size="sm"
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
                  label={tLabels("employee")}
                  model="employee.dropdown"
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
              name="contractType"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("contractType")}
                  size="sm"
                />
              )}
            />

            <Controller
              control={control}
              name="status"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("status")}
                  size="sm"
                />
              )}
            />

            <Controller
              control={control}
              name="startDate"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("startDate")}
                  size="sm"
                  type="date"
                />
              )}
            />

            <Controller
              control={control}
              name="endDate"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("endDate")}
                  size="sm"
                  type="date"
                />
              )}
            />

            <Controller
              control={control}
              name="baseSalary"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("baseSalary")}
                  size="sm"
                  type="number"
                />
              )}
            />

            <Controller
              control={control}
              name="currency"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("currency")}
                  size="sm"
                />
              )}
            />
          </div>
          </div>
        </IBaseCardBody>
      </IBaseCard>

      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {tLabels("additionalInfo")}
            </h2>
          </div>
          <div className="flex flex-col gap-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="workingHours"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("workingHours")}
                  size="sm"
                  type="number"
                />
              )}
            />

            <Controller
              control={control}
              name="probationPeriod"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("probationPeriod")}
                  size="sm"
                  type="number"
                />
              )}
            />

            <Controller
              control={control}
              name="probationEndDate"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("probationEndDate")}
                  size="sm"
                  type="date"
                />
              )}
            />

            <Controller
              control={control}
              name="signedDate"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("signedDate")}
                  size="sm"
                  type="date"
                />
              )}
            />
          </div>

          <div className="mt-4">
            <Controller
              control={control}
              name="notes"
              render={({ field, fieldState }) => (
                <IBaseTextarea
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("notes")}
                  minRows={2}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
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
