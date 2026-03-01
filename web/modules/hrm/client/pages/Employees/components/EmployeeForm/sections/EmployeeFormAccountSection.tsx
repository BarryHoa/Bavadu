"use client";

import type { EmployeeFormValues } from "../../../validation/employeeValidation";
import type { Control } from "react-hook-form";

import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";

import { IBaseCard, IBaseCardBody } from "@base/client";
import { IBaseButton, IBaseInput, IBaseInputPassword } from "@base/client/components";

interface EmployeeFormAccountSectionProps {
  control: Control<EmployeeFormValues>;
  loginCheckMessage: string | null;
  loginCheckLoading: boolean;
  onCheckLoginExists: (identifier: string) => void;
  onGenPassword: () => void;
}

export function EmployeeFormAccountSection({
  control,
  loginCheckMessage,
  loginCheckLoading,
  onCheckLoginExists,
  onGenPassword,
}: EmployeeFormAccountSectionProps) {
  const t = useTranslations("hrm.employee.create.labels");
  return (
    <IBaseCard className="border border-default-200/60 shadow-sm">
      <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
        <h2 className="text-lg font-semibold text-foreground">
          {t("sectionAccount")}
        </h2>
        <Controller
          control={control}
          name="loginIdentifier"
          render={({ field, fieldState }) => (
            <div className="space-y-1">
              <IBaseInput
                {...field}
                errorMessage={
                  fieldState.error?.message ??
                  loginCheckMessage ??
                  undefined
                }
                isInvalid={fieldState.invalid || !!loginCheckMessage}
                isRequired
                label={t("loginIdentifier")}
                placeholder={t("loginIdentifierPlaceholder")}
                size="sm"
                onBlur={() => onCheckLoginExists(field.value ?? "")}
              />
              {loginCheckLoading && (
                <span className="text-default-500 text-xs">
                  {t("checkingLogin")}
                </span>
              )}
            </div>
          )}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <IBaseInputPassword
                {...field}
                className="sm:min-w-[240px] sm:flex-1"
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label={t("password")}
                placeholder={t("passwordPlaceholder")}
                size="sm"
              />
            )}
          />
          <IBaseButton
            className="shrink-0"
            color="primary"
            size="sm"
            variant="flat"
            onPress={onGenPassword}
          >
            {t("generatePassword")}
          </IBaseButton>
        </div>
      </IBaseCardBody>
    </IBaseCard>
  );
}
