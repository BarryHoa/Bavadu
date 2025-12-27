"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  IBaseTableColumnDefinition,
  ViewListDataTable,
} from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import { formatDate } from "@base/client/utils/date/formatDate";
import { IBaseChip } from "@base/client";
import { useTranslations } from "next-intl";
import React from "react";
import { TimesheetDto } from "@mdl/hrm/client/interface/Timesheet";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

type TimesheetRow = TimesheetDto & {
  workDate?: string | null;
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function TimesheetsListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.timesheets");
  const getLocalizedText = useLocalizedText();

  // React Compiler will automatically optimize this array creation
  const columns: IBaseTableColumnDefinition<TimesheetRow>[] = [
      {
        key: "employee",
        label: t("labels.employee"),
        render: (value, row) => {
          if (!row?.id) return null;

          return (
            <LinkAs href={`/workspace/modules/hrm/timesheets/view/${row.id}`}>
              {getLocalizedText(row.employee?.fullName) ||
                row.employee?.employeeCode ||
                "—"}
            </LinkAs>
          );
        },
      },
      {
        key: "workDate",
        label: t("labels.workDate"),
        render: (value) => formatDate(value),
      },
      {
        key: "shift",
        label: t("labels.shift"),
        render: (value, row) => getLocalizedText(row.shift?.name),
      },
      {
        key: "checkInTime",
        label: t("labels.checkInTime"),
        render: (value) => (value ? formatDate(value) : "—"),
      },
      {
        key: "checkOutTime",
        label: t("labels.checkOutTime"),
        render: (value) => (value ? formatDate(value) : "—"),
      },
      {
        key: "actualHours",
        label: t("labels.actualHours"),
        render: (value) => (value ? `${value}h` : "—"),
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
          const viewLink = `/workspace/modules/hrm/timesheets/view/${row.id}`;

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
      <ViewListDataTable<TimesheetRow>
        actionsRight={[
          {
            key: "new",
            title: t("create"),
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/hrm/timesheets/create",
            },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="hrm.timesheet"
      />
    </div>
  );
}
