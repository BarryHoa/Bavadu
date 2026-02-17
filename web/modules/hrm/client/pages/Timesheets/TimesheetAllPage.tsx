"use client";

import { useTranslations } from "next-intl";
import React from "react";

import { IBaseCard, IBaseCardBody } from "@base/client/components";

/**
 * Placeholder for "Timesheet mọi người" (view all employees' timesheets).
 * Full implementation: list employees with month filter, link to monthly view with ?employeeId=...
 */
export default function TimesheetAllPage(): React.ReactNode {
  const t = useTranslations("hrm.timesheets");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t("allPeople")}</h1>
      <IBaseCard>
        <IBaseCardBody>
          <p className="text-muted-foreground">
            {t("allPeoplePlaceholder")}
          </p>
        </IBaseCardBody>
      </IBaseCard>
    </div>
  );
}
