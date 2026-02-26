"use client";

import { Shield, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBasePageLayout,
} from "@base/client";
import { useSetBreadcrumbs } from "@base/client/hooks";

const ROLES_SETTINGS_PATH = "/workspace/settings/roles";

/** HRM permission resource groups for display */
const HRM_PERMISSION_GROUPS = [
  { resource: "employee", labelKey: "employee" },
  { resource: "department", labelKey: "department" },
  { resource: "position", labelKey: "position" },
  { resource: "contract", labelKey: "contract" },
  { resource: "shift", labelKey: "shift" },
  { resource: "leave_type", labelKey: "leaveType" },
  { resource: "leave_request", labelKey: "leaveRequest" },
  { resource: "timesheet", labelKey: "timesheet" },
  { resource: "payroll", labelKey: "payroll" },
  { resource: "job_requisition", labelKey: "jobRequisition" },
  { resource: "candidate", labelKey: "candidate" },
  { resource: "course", labelKey: "course" },
  { resource: "certificate", labelKey: "certificate" },
  { resource: "performance_review", labelKey: "performanceReview" },
] as const;

export default function PermissionsPage(): React.ReactNode {
  const t = useTranslations("hrm.permissions");
  useSetBreadcrumbs([{ label: t("title") }]);

  return (
    <IBasePageLayout title={t("title")} subtitle={t("description")}>
      <div className="space-y-6">
        <IBaseCard className="border border-default-200/60 shadow-sm">
          <IBaseCardBody className="gap-4 px-4 py-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-default-600">{t("intro")}</p>
              <IBaseButton
                as={Link}
                href={ROLES_SETTINGS_PATH}
                color="primary"
                variant="flat"
                endContent={<ExternalLink className="size-4" />}
              >
                {t("manageRoles")}
              </IBaseButton>
            </div>
          </IBaseCardBody>
        </IBaseCard>

        <IBaseCard className="border border-default-200/60 shadow-sm">
          <IBaseCardBody className="gap-4 px-4 py-4 md:p-5">
            <h3 className="flex items-center gap-2 text-lg font-medium">
              <Shield className="size-5" />
              {t("permissionGroups")}
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {HRM_PERMISSION_GROUPS.map(({ resource, labelKey }) => (
                <li
                  key={resource}
                  className="rounded-md border border-default-200/60 bg-default-50/50 px-3 py-2 text-sm"
                >
                  <span className="font-medium">
                    {t(`resources.${labelKey}`)}
                  </span>
                  <span className="text-default-500"> (hrm.{resource})</span>
                </li>
              ))}
            </ul>
          </IBaseCardBody>
        </IBaseCard>
      </div>
    </IBasePageLayout>
  );
}
