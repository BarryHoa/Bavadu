"use client";

import type { EmployeeFormValues } from "../../../validation/employeeValidation";
import type { Control } from "react-hook-form";

import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";

import { IBaseCard, IBaseCardBody } from "@base/client";
import { IBaseTextarea } from "@base/client/components";

interface EmployeeFormEducationSectionProps {
  control: Control<EmployeeFormValues>;
}

export function EmployeeFormEducationSection({
  control,
}: EmployeeFormEducationSectionProps) {
  const t = useTranslations("hrm.employee.create.labels");
  return (
    <IBaseCard className="border border-default-200/60 shadow-sm">
      <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
        <h2 className="text-lg font-semibold text-foreground">
          {t("sectionEducationExperience")}
        </h2>
        <Controller
          control={control}
          name="educationLevel"
          render={({ field, fieldState }) => (
            <IBaseTextarea
              {...field}
              errorMessage={fieldState.error?.message}
              isInvalid={fieldState.invalid}
              label={t("educationLevel")}
              minRows={2}
              placeholder={t("educationLevelPlaceholder")}
              size="sm"
            />
          )}
        />
        <Controller
          control={control}
          name="experience"
          render={({ field, fieldState }) => (
            <IBaseTextarea
              {...field}
              errorMessage={fieldState.error?.message}
              isInvalid={fieldState.invalid}
              label={t("experience")}
              minRows={3}
              placeholder={t("experiencePlaceholder")}
              size="sm"
            />
          )}
        />
      </IBaseCardBody>
    </IBaseCard>
  );
}
