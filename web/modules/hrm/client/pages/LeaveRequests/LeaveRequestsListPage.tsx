"use client";

import { useTranslations } from "next-intl";
import React from "react";

import { IBaseChip } from "@base/client";
import {
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  IBaseTableColumnDefinition,
  ViewListDataTable,
} from "@base/client/components";
import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import IBaseLink from "@base/client/components/IBaseLink";
import { useHasPermissions, useLocalizedText } from "@base/client/hooks";
import { formatDate } from "@base/client/utils/date/formatDate";
import { LeaveRequestDto } from "@mdl/hrm/client/interface/LeaveRequest";

type LeaveRequestRow = LeaveRequestDto & {
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function LeaveRequestsListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.leaveRequests");
  const getLocalizedText = useLocalizedText();
  const { hasPermission: canCreate } = useHasPermissions(["hrm.leave_request.create"]);

  // React Compiler will automatically optimize this array creation
  const columns: IBaseTableColumnDefinition<LeaveRequestRow>[] = [
    {
      key: "employee",
      label: t("labels.employee"),
      render: (value, row) => {
        if (!row?.id) return null;

        return (
          <IBaseLink
            href={`/workspace/modules/hrm/leave-requests/view/${row.id}`}
          >
            {getLocalizedText(row.employee?.fullName) ||
              row.employee?.employeeCode ||
              "—"}
          </IBaseLink>
        );
      },
    },
    {
      key: "leaveType",
      label: t("labels.leaveType"),
      render: (value, row) => getLocalizedText(row.leaveType?.name),
    },
    {
      key: "startDate",
      label: t("labels.startDate"),
      render: (value) => formatDate(value),
    },
    {
      key: "endDate",
      label: t("labels.endDate"),
      render: (value) => formatDate(value),
    },
    {
      key: "days",
      label: t("labels.days"),
      render: (value) => `${value} ${t("labels.day")}`,
    },
    {
      key: "status",
      label: t("labels.status"),
      render: (value) => (
        <IBaseChip className="capitalize" size="sm" variant="flat">
          {value || "pending"}
        </IBaseChip>
      ),
    },
    {
      key: I_BASE_TABLE_COLUMN_KEY_ACTION,
      label: tDataTable("columns.action"),
      align: "end",
      render: (_, row) => {
        if (!row?.id) return null;
        const viewLink = `/workspace/modules/hrm/leave-requests/view/${row.id}`;

        return (
          <ActionMenu
            actions={[
              {
                key: "view",
                label: tDataTable("columns.view"),
                href: viewLink,
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <ViewListDataTable<LeaveRequestRow>
        actionsRight={
          canCreate
            ? [
                {
                  key: "new",
                  title: t("create"),
                  type: "link",
                  color: "primary",
                  props: { href: "/workspace/modules/hrm/leave-requests/create" },
                },
              ]
            : undefined
        }
        columns={columns}
        isDummyData={false}
        model="hrm.leave-request"
      />
    </div>
  );
}
