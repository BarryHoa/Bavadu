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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormValues>({
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
        </IBaseCardBody>
      </IBaseCard>
    </form>
  );
}
