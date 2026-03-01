"use client";

import type { EmployeeFormValues } from "../../../validation/employeeValidation";
import type { Control } from "react-hook-form";

import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";

import { IBaseCard, IBaseCardBody } from "@base/client";
import { IBaseTextarea } from "@base/client/components";

interface EmployeeFormNotesSectionProps {
  control: Control<EmployeeFormValues>;
}

export function EmployeeFormNotesSection({
  control,
}: EmployeeFormNotesSectionProps) {
  const t = useTranslations("hrm.employee.create.labels");
  return (
    <IBaseCard className="border border-default-200/60 shadow-sm">
      <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
        <h2 className="text-lg font-semibold text-foreground">
          {t("sectionNotes")}
        </h2>
        <Controller
          control={control}
          name="notes"
          render={({ field, fieldState }) => (
            <IBaseTextarea
              {...field}
              errorMessage={fieldState.error?.message}
              isInvalid={fieldState.invalid}
              minRows={3}
              placeholder={t("notesPlaceholder")}
              size="sm"
            />
          )}
        />
      </IBaseCardBody>
    </IBaseCard>
  );
}
