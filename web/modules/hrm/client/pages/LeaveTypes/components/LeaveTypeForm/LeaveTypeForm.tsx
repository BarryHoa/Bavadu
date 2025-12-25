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
import { useMemo } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import {
  createLeaveTypeValidation,
  type LeaveTypeFormValues,
} from "../../validation/leaveTypeValidation";

export type { LeaveTypeFormValues };

interface LeaveTypeFormProps {
  onSubmit: (values: LeaveTypeFormValues) => Promise<void>;
  onCancel?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
  defaultValues?: Partial<LeaveTypeFormValues>;
}

export default function LeaveTypeForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
}: LeaveTypeFormProps) {
  const t = useTranslations("hrm.leaveTypes");
  const tCommon = useTranslations("common");

  const validation = useMemo(() => createLeaveTypeValidation(t), [t]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LeaveTypeFormValues>({
    resolver: valibotResolver(validation.leaveTypeFormSchema) as any,
    defaultValues: {
      carryForward: "false",
      requiresApproval: "true",
      isPaid: "true",
      isActive: "true",
      accrualType: "monthly",
      ...defaultValues,
    },
  });

  const onSubmitForm: SubmitHandler<LeaveTypeFormValues> = async (values) => {
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
              name="accrualType"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  isRequired
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.accrualType")}
                  model="base-accrual-type"
                  selectedKey={field.value}
                  onSelectionChange={(key) => {
                    field.onChange(key || undefined);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="accrualRate"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.accrualRate")}
                  min={0}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : null}
                  onValueChange={(val) => field.onChange(val ?? null)}
                />
              )}
            />
            <Controller
              control={control}
              name="maxAccrual"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.maxAccrual")}
                  min={0}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : null}
                  onValueChange={(val) => field.onChange(val ?? null)}
                />
              )}
            />
            <Controller
              control={control}
              name="maxCarryForward"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("labels.maxCarryForward")}
                  min={0}
                  size="sm"
                  value={typeof field.value === "number" ? field.value : null}
                  onValueChange={(val) => field.onChange(val ?? null)}
                />
              )}
            />
            <Controller
              control={control}
              name="carryForward"
              render={({ field }) => (
                <IBaseCheckbox
                  isSelected={field.value === "true"}
                  onValueChange={(val) =>
                    field.onChange(val ? "true" : "false")
                  }
                >
                  {t("labels.carryForward")}
                </IBaseCheckbox>
              )}
            />
            <Controller
              control={control}
              name="requiresApproval"
              render={({ field }) => (
                <IBaseCheckbox
                  isSelected={field.value === "true"}
                  onValueChange={(val) =>
                    field.onChange(val ? "true" : "false")
                  }
                >
                  {t("labels.requiresApproval")}
                </IBaseCheckbox>
              )}
            />
            <Controller
              control={control}
              name="isPaid"
              render={({ field }) => (
                <IBaseCheckbox
                  isSelected={field.value === "true"}
                  onValueChange={(val) =>
                    field.onChange(val ? "true" : "false")
                  }
                >
                  {t("labels.isPaid")}
                </IBaseCheckbox>
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
