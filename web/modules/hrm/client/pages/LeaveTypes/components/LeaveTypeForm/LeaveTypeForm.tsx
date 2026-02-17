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
  IBaseTextarea,
} from "@base/client";
import {
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseInputNumber,
  IBaseSingleSelectAsync,
} from "@base/client/components";

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
  mode?: "create" | "edit";
}

export default function LeaveTypeForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
  mode = "create",
}: LeaveTypeFormProps) {
  const t = useTranslations("hrm.leaveTypes");
  const tCommon = useTranslations("common");

  // React Compiler will automatically optimize this computation
  const validation = createLeaveTypeValidation(t);

  const { control, handleSubmit } = useForm<LeaveTypeFormValues>({
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
            </div>

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

            <div className="grid gap-4 md:grid-cols-2">
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
            </div>

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

            <div className="my-1 border-t border-default-200" />

            <div className="flex flex-col gap-4">
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
            </div>

            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
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
              )}
            />
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
