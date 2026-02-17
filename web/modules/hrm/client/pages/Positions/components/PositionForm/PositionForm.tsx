"use client";

import type { PositionFormValues } from "../../validation/positionValidation";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import React from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import {
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseSingleSelectAsync,
} from "@base/client/components";
import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
} from "@base/client";

import { createPositionValidation } from "../../validation/positionValidation";

export type { PositionFormValues };

interface PositionFormProps {
  onSubmit: (values: PositionFormValues) => Promise<void>;
  onCancel?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
  defaultValues?: Partial<PositionFormValues>;
  mode?: "create" | "edit";
}

export default function PositionForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
  mode = "create",
}: PositionFormProps) {
  const t = useTranslations("hrm.position.create.validation");
  const tLabels = useTranslations("hrm.position.create.labels");

  // React Compiler will automatically optimize this computation
  const validation = createPositionValidation(t);

  const { control, handleSubmit } = useForm<PositionFormValues>({
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
                name="code"
                render={({ field, fieldState }) => (
                  <IBaseInput
                    {...field}
                    isRequired
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={tLabels("code")}
                    size="sm"
                  />
                )}
              />
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <IBaseInputMultipleLang
                    isRequired
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={tLabels("name")}
                    size="sm"
                    value={field.value || { vi: "", en: "" }}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <Controller
              control={control}
              name="departmentId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  isRequired
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("department")}
                  model="department.dropdown"
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
              name="reportsTo"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("reportsTo")}
                  model="position.dropdown"
                  selectedKey={field.value}
                  size="sm"
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />

            <div className="my-1 border-t border-default-200" />

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="jobFamily"
                render={({ field, fieldState }) => (
                  <IBaseInput
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={tLabels("jobFamily")}
                    size="sm"
                  />
                )}
              />
              <Controller
                control={control}
                name="jobGrade"
                render={({ field, fieldState }) => (
                  <IBaseInput
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={tLabels("jobGrade")}
                    size="sm"
                  />
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="minSalary"
                render={({ field, fieldState }) => (
                  <IBaseInput
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={tLabels("minSalary")}
                    size="sm"
                    type="number"
                  />
                )}
              />
              <Controller
                control={control}
                name="maxSalary"
                render={({ field, fieldState }) => (
                  <IBaseInput
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={tLabels("maxSalary")}
                    size="sm"
                    type="number"
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
