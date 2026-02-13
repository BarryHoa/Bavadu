"use client";

import { IBaseCard, IBaseCardBody } from "@base/client";
import { Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";

export function DepartmentPageSidebar() {
  const t = useTranslations("hrm.department.create.labels");

  return (
    <IBaseCard className="border border-default-200/60 shadow-sm">
      <IBaseCardBody className="gap-3 p-4">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-warning-500 shrink-0" />
          <h3 className="text-sm font-semibold text-foreground">
            {t("sidebarTips")}
          </h3>
        </div>
        <ul className="flex flex-col gap-2 text-sm text-default-600">
          <li>• {t("sidebarTipCode")}</li>
          <li>• {t("sidebarTipParent")}</li>
          <li>• {t("sidebarTipLevel")}</li>
        </ul>
      </IBaseCardBody>
    </IBaseCard>
  );
}
