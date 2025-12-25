"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
  ViewListDataTable,
} from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import { formatDate } from "@base/client/utils/date/formatDate";
import { Chip } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
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

  const columns = useMemo<DataTableColumn<TimesheetRow>[]>(
    () => [
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
          <Chip className="capitalize" size="sm" variant="flat">
            {value || "pending"}
          </Chip>
        ),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
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
    ],
    [tDataTable, t, getLocalizedText],
  );

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
