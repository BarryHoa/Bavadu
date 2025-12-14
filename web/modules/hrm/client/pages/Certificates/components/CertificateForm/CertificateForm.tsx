"use client";

import {
  DatePicker,
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseSingleSelectAsync,
} from "@base/client/components";
import { Button } from "@heroui/button";
import { Card, CardBody, Checkbox } from "@heroui/react";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { parseDate } from "@internationalized/date";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
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

  const validation = useMemo(() => createCertificateValidation(t), [t]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CertificateFormValues>({
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
              name="issuer"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={t("labels.issuer")}
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
              name="certificateNumber"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={t("labels.certificateNumber")}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="issueDate"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker
                  label={t("labels.issueDate")}
                  value={
                    field.value
                      ? typeof field.value === "string"
                        ? parseDate(field.value)
                        : field.value
                      : null
                  }
                  onChange={(val) =>
                    field.onChange(val ? val.toString() : null)
                  }
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  isRequired
                />
              )}
            />
            <Controller
              name="expiryDate"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker
                  label={t("labels.expiryDate")}
                  value={
                    field.value
                      ? typeof field.value === "string"
                        ? parseDate(field.value)
                        : field.value
                      : null
                  }
                  onChange={(val) =>
                    field.onChange(val ? val.toString() : null)
                  }
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="documentUrl"
              control={control}
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  label={t("labels.documentUrl")}
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
                  onValueChange={(val) =>
                    field.onChange(val ? "true" : "false")
                  }
                >
                  {t("labels.isActive")}
                </Checkbox>
              )}
            />
          </div>
        </CardBody>
      </Card>
    </form>
  );
}
