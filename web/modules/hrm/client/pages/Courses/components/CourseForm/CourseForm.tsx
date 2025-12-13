"use client";

import {
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseInputNumber,
  IBaseSingleSelectAsync,
} from "@base/client/components";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@heroui/button";
import { Card, CardBody, Checkbox, Textarea } from "@heroui/react";
import {
  createCourseValidation,
  type CourseFormValues,
} from "../../validation/courseValidation";

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

  const validation = useMemo(() => createCourseValidation(t), [t]);

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
              name="code"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={t("labels.code")}
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
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputMultipleLang
                  label={t("labels.name")}
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
              name="category"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.category")}
                  model="base-course-category"
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
              name="duration"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  label={t("labels.duration")}
                  size="sm"
                  value={field.value?.toString() ?? ""}
                  onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  min={0}
                />
              )}
            />
            <Controller
              name="format"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  label={t("labels.format")}
                  model="base-course-format"
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
              name="instructor"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={t("labels.instructor")}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Checkbox
                  isSelected={field.value === "true"}
                  onValueChange={(val) => field.onChange(val ? "true" : "false")}
                >
                  {t("labels.isActive")}
                </Checkbox>
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <div className="md:col-span-2">
                  <Textarea
                    {...field}
                    label={t("labels.description")}
                    size="sm"
                    value={field.value ? JSON.stringify(field.value) : ""}
                    onValueChange={(val) => field.onChange(val ? {} : undefined)}
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

