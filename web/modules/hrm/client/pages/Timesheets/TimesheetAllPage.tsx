"use client";

import { useTranslations } from "next-intl";
import React, { useCallback, useState } from "react";

import { IBaseButton, IBaseCard, IBaseCardBody, IBaseImportTemplate } from "@base/client/components";
import { usePermission } from "@base/client/hooks";

/**
 * "Timesheet mọi người" (view all employees' timesheets).
 * Import/Export gated by hrm.timesheet.import and hrm.timesheet.export.
 * Template download requires hrm.timesheet.import (inside Import modal).
 */
export default function TimesheetAllPage(): React.ReactNode {
  const t = useTranslations("hrm.timesheets");
  const { hasPermission } = usePermission();
  const canImport = hasPermission("hrm.timesheet.import");
  const canExport = hasPermission("hrm.timesheet.export");
  const [importOpen, setImportOpen] = useState(false);

  const openImport = useCallback(() => setImportOpen(true), []);
  const closeImport = useCallback(() => setImportOpen(false), []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">{t("allPeople")}</h1>
        <div className="flex items-center gap-2">
          {canImport && (
            <IBaseButton color="primary" variant="flat" onPress={openImport}>
              Nhập chấm công
            </IBaseButton>
          )}
          {canExport && (
            <IBaseButton color="primary" variant="bordered" isDisabled>
              Xuất chấm công (sắp có)
            </IBaseButton>
          )}
        </div>
      </div>
      <IBaseCard>
        <IBaseCardBody>
          <p className="text-muted-foreground">
            {t("allPeoplePlaceholder")}
          </p>
        </IBaseCardBody>
      </IBaseCard>
      {canImport && (
        <IBaseImportTemplate
          isOpen={importOpen}
          onOpenChange={setImportOpen}
          templateKey="hrm.timesheet"
          title="Nhập chấm công"
          requiredPermission="hrm.timesheet.import"
          onSuccess={() => closeImport()}
        />
      )}
    </div>
  );
}
