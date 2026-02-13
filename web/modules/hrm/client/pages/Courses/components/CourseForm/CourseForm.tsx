"use client";

import {
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseInputNumber,
  IBaseSingleSelectAsync,
} from "@base/client/components";
import { IBaseButton } from "@base/client";
import { IBaseCard, IBaseCardBody, IBaseCheckbox, IBaseTextarea } from "@base/client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import React from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import {
  createCourseValidation,
  type CourseFormValues,
} from "../../validation/courseValidation";

export type { CourseFormValues };

interface CourseFormProps {
  onSubmit: (values: CourseFormValues) => Promise<void>;
  onCancel?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
  defaultValues?: Partial<CourseFormValues>;
}

export default function CourseForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
}: CourseFormProps) {
  const t = useTranslations("hrm.courses");
  const tCommon = useTranslations("common");

  // React Compiler will automatically optimize this computation
  const validation = createCourseValidation(t);

  const { control, handleSubmit } = useForm<CourseFormValues>({
    resolver: valibotResolver(validation.courseFormSchema) as any,
    defaultValues: {
      isActive: "true",
      ...defaultValues,
    },
  });

  const onSubmitForm: SubmitHandler<CourseFormValues> = async (values) => {
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
              name="code"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.code")}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
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
                  label={t("labels.name")}
                  size="sm"
                  value={field.value as any}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="category"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.category")}
                  model="base-course-category"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="duration"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.duration")}
                  min={0}
                  size="sm"
                  value={
                    typeof field.value === "number"
                      ? field.value
                      : (field.value ?? null)
                  }
                  onValueChange={(val) => field.onChange(val ?? undefined)}
                />
              )}
            />
            <Controller
              control={control}
              name="format"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.format")}
                  model="base-course-format"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="instructor"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.instructor")}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <IBaseCheckbox
                  isSelected={field.value === "true"}
                  onValueChange={(val) =>
                    field.onChange(val ? "true" : "false")
                  }
                >
                  {t("labels.isActive")}
                </IBaseCheckbox>
              )}
            />
            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <div className="md:col-span-2">
                  <IBaseTextarea
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={t("labels.description")}
                    size="sm"
                    value={field.value ? JSON.stringify(field.value) : ""}
                    onValueChange={(val) =>
                      field.onChange(val ? {} : undefined)
                    }
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
