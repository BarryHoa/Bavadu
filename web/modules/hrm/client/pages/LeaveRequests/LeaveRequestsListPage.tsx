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
import { LeaveRequestDto } from "@mdl/hrm/client/interface/LeaveRequest";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

type LeaveRequestRow = LeaveRequestDto & {
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function LeaveRequestsListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.leaveRequests");
  const getLocalizedText = useLocalizedText();

  const columns = useMemo<DataTableColumn<LeaveRequestRow>[]>(
    () => [
      {
        key: "employee",
        label: t("labels.employee"),
        render: (value, row) => {
          if (!row?.id) return null;
          return (
            <LinkAs href={`/workspace/modules/hrm/leave-requests/view/${row.id}`}>
              {getLocalizedText(row.employee?.fullName) || row.employee?.employeeCode || "—"}
            </LinkAs>
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
          <Chip size="sm" variant="flat" className="capitalize">
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
    ],
    [tDataTable, t, getLocalizedText]
  );

  return (
    <div className="space-y-4">
      <ViewListDataTable<LeaveRequestRow>
        model="hrm.leave-request"
        columns={columns}
        isDummyData={false}
        actionsRight={[
          {
            key: "new",
            title: t("create"),
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/hrm/leave-requests/create",
            },
          },
        ]}
      />
    </div>
  );
}

