"use client";

import type { Control } from "react-hook-form";
import type { EmployeeFormValues } from "../../../validation/employeeValidation";

import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";

import { IBaseCard, IBaseCardBody } from "@base/client";
import {
  IBaseDatePicker,
  IBaseInput,
  IBaseInputPhone,
  IBaseSingleSelectAsync,
} from "@base/client/components";

interface EmployeeFormEmploymentSectionProps {
  control: Control<EmployeeFormValues>;
}

export function EmployeeFormEmploymentSection({
  control,
}: EmployeeFormEmploymentSectionProps) {
  const t = useTranslations("hrm.employee.create.labels");
  return (
    <IBaseCard className="border border-default-200/60 shadow-sm">
      <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
        <h2 className="text-lg font-semibold text-foreground">
          {t("sectionEmployment")}
        </h2>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="departmentId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  isRequired
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("department")}
                  model="department.dropdown"
                  selectedKey={field.value}
                  size="sm"
                  onSelectionChange={(key) => field.onChange(key || undefined)}
                />
              )}
            />
            <Controller
              control={control}
              name="positionId"
              render={({ field, fieldState }) => (
                <IBaseSingleSelectAsync
                  isRequired
                  callWhen="mount"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("position")}
                  model="position.dropdown"
                  selectedKey={field.value}
                  size="sm"
                  onSelectionChange={(key) => field.onChange(key || undefined)}
                />
              )}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="hireDate"
              render={({ field, fieldState }) => (
                <IBaseDatePicker
                  allowClear
                  errorMessage={fieldState.error?.message}
                  format="YYYY-MM-DD"
                  isInvalid={fieldState.invalid}
                  label={t("hireDate")}
                  size="sm"
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v ?? undefined)}
                />
              )}
            />
            <Controller
              control={control}
              name="probationEndDate"
              render={({ field, fieldState }) => (
                <IBaseDatePicker
                  allowClear
                  errorMessage={fieldState.error?.message}
                  format="YYYY-MM-DD"
                  isInvalid={fieldState.invalid}
                  label={t("probationEndDate")}
                  size="sm"
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v ?? undefined)}
                />
              )}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="emergencyContactName"
              render={({ field }) => (
                <IBaseInput
                  {...field}
                  label={t("emergencyContactName")}
                  size="sm"
                />
              )}
            />
            <Controller
              control={control}
              name="emergencyContactPhone"
              render={({ field }) => (
                <IBaseInputPhone
                  label={t("emergencyContactPhone")}
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="rounded-lg border border-default-200/60 bg-default-50/50 p-4">
            <h3 className="mb-3 text-sm font-medium text-foreground">
              {t("sectionBank")}
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Controller
                control={control}
                name="bankName"
                render={({ field }) => (
                  <IBaseInput {...field} label={t("bankName")} size="sm" />
                )}
              />
              <Controller
                control={control}
                name="bankAccount"
                render={({ field }) => (
                  <IBaseInput {...field} label={t("bankAccount")} size="sm" />
                )}
              />
              <Controller
                control={control}
                name="bankBranch"
                render={({ field }) => (
                  <IBaseInput {...field} label={t("bankBranch")} size="sm" />
                )}
              />
            </div>
          </div>
        </div>
      </IBaseCardBody>
    </IBaseCard>
  );
}
