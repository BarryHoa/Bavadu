"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import React from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseCheckbox,
  toDayjs,
} from "@base/client";
import {
  IBaseDatePicker,
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseSingleSelectAsync,
} from "@base/client/components";

import {
  createCertificateValidation,
  type CertificateFormValues,
} from "../../validation/certificateValidation";

export type { CertificateFormValues };

interface CertificateFormProps {
  onSubmit: (values: CertificateFormValues) => Promise<void>;
  onCancel?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
  defaultValues?: Partial<CertificateFormValues>;
}

export default function CertificateForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
}: CertificateFormProps) {
  const t = useTranslations("hrm.certificates");
  const tCommon = useTranslations("common");

  // React Compiler will automatically optimize this computation
  const validation = createCertificateValidation(t);

  const { control, handleSubmit } = useForm<CertificateFormValues>({
    resolver: valibotResolver(validation.certificateFormSchema) as any,
    defaultValues: {
      isActive: "true",
      ...defaultValues,
    },
  });

  const onSubmitForm: SubmitHandler<CertificateFormValues> = async (values) => {
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
              name="issuer"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.issuer")}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="certificateNumber"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.certificateNumber")}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="issueDate"
              render={({ field, fieldState }) => (
                <IBaseDatePicker
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.issueDate")}
                  value={field.value ? toDayjs(field.value) : undefined}
                  onChange={(val) =>
                    field.onChange(val ? val.toString() : null)
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="expiryDate"
              render={({ field, fieldState }) => (
                <IBaseDatePicker
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.expiryDate")}
                  value={field.value ? toDayjs(field.value) : undefined}
                  onChange={(val) =>
                    field.onChange(val ? val.toString() : null)
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="documentUrl"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.documentUrl")}
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
