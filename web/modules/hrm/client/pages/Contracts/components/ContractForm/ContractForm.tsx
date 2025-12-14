"use client";

import { IBaseInput, IBaseSingleSelectAsync } from "@base/client/components";
import { Button } from "@heroui/button";
import { Card, CardBody, Textarea } from "@heroui/react";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import type { ContractFormValues } from "../../validation/contractValidation";
import { createContractValidation } from "../../validation/contractValidation";

export type { ContractFormValues };

interface ContractFormProps {
  onSubmit: (values: ContractFormValues) => Promise<void>;
  onCancel?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
  defaultValues?: Partial<ContractFormValues>;
}

export default function ContractForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
}: ContractFormProps) {
  const t = useTranslations("hrm.contract.create.validation");
  const tLabels = useTranslations("hrm.contract.create.labels");

  const validation = useMemo(() => createContractValidation(t), [t]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContractFormValues>({
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
    <form className="space-y-3" onSubmit={handleSubmit(onSubmitForm)}>
      {submitError ? (
        <div className="mb-3 rounded-large border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-600">
          {submitError}
        </div>
      ) : null}

      <div className="sticky top-0 z-10 flex justify-end gap-3 py-2 mb-3 bg-background border-b border-divider -mx-4 px-4">
        {onCancel && (
          <Button size="sm" variant="light" onPress={onCancel}>
            {tLabels("cancel")}
          </Button>
        )}
        <Button
          color="primary"
          type="submit"
          size="sm"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {tLabels("save")}
        </Button>
      </div>

      <Card>
        <CardBody className="p-4">
          <h2 className="text-base font-semibold mb-4">
            {tLabels("basicInfo")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="contractNumber"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={tLabels("contractNumber")}
                  size="sm"
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
                  label={tLabels("employee")}
                  size="sm"
                  model="employee.dropdown"
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
              name="contractType"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={tLabels("contractType")}
                  size="sm"
                  isRequired
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={tLabels("status")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="startDate"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  type="date"
                  label={tLabels("startDate")}
                  size="sm"
                  isRequired
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="endDate"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  type="date"
                  label={tLabels("endDate")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="baseSalary"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  type="number"
                  label={tLabels("baseSalary")}
                  size="sm"
                  isRequired
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="currency"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={tLabels("currency")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-4">
          <h2 className="text-base font-semibold mb-4">
            {tLabels("additionalInfo")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="workingHours"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  type="number"
                  label={tLabels("workingHours")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="probationPeriod"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  type="number"
                  label={tLabels("probationPeriod")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="probationEndDate"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  type="date"
                  label={tLabels("probationEndDate")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="signedDate"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  type="date"
                  label={tLabels("signedDate")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </div>

          <div className="mt-4">
            <Controller
              name="notes"
              control={control}
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  label={tLabels("notes")}
                  size="sm"
                  minRows={2}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </div>
        </CardBody>
      </Card>
    </form>
  );
}
