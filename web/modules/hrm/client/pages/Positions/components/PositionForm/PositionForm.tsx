"use client";

import { IBaseInput, IBaseInputMultipleLang, IBaseSingleSelectAsync } from "@base/client/components";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/react";
import type { PositionFormValues } from "../../validation/positionValidation";
import { createPositionValidation } from "../../validation/positionValidation";

export type { PositionFormValues };

interface PositionFormProps {
  onSubmit: (values: PositionFormValues) => Promise<void>;
  onCancel?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
  defaultValues?: Partial<PositionFormValues>;
}

export default function PositionForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
}: PositionFormProps) {
  const t = useTranslations("hrm.position.create.validation");
  const tLabels = useTranslations("hrm.position.create.labels");

  const validation = useMemo(() => createPositionValidation(t), [t]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PositionFormValues>({
    resolver: valibotResolver(validation.positionFormSchema) as any,
    defaultValues: {
      isActive: true,
      ...defaultValues,
    },
  });

  const onSubmitForm: SubmitHandler<PositionFormValues> = async (values) => {
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
          <h2 className="text-base font-semibold mb-4">{tLabels("basicInfo")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="code"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={tLabels("code")}
                  size="sm"
                  isRequired
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputMultipleLang
                  label={tLabels("name")}
                  size="sm"
                  value={field.value || { vi: "", en: "" }}
                  onChange={field.onChange}
                  isRequired
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="departmentId"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={tLabels("department")}
                  size="sm"
                  model="department.dropdown"
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
              name="reportsTo"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={tLabels("reportsTo")}
                  size="sm"
                  model="position.dropdown"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="jobFamily"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={tLabels("jobFamily")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="jobGrade"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={tLabels("jobGrade")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="minSalary"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  type="number"
                  label={tLabels("minSalary")}
                  size="sm"
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="maxSalary"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  type="number"
                  label={tLabels("maxSalary")}
                  size="sm"
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

