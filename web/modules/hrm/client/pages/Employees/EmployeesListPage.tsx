"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
} from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { formatDate } from "@base/client/utils/date/formatDate";
import { Chip } from "@base/client";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Employee } from "@mdl/hrm/client/interface/Employee";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

type EmployeeRow = Employee & {
  hireDate?: number | string | null;
  createdAt?: number | string | null;
};

export default function EmployeesListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.employee.list");
  const getLocalizedText = useLocalizedText();

  const columns = useMemo<DataTableColumn<EmployeeRow>[]>(
    () => [
      {
        key: "employeeCode",
        label: t("employeeCode"),
        render: (value, row) => {
          if (!row?.id) return value;

          return (
            <LinkAs href={`/workspace/modules/hrm/employees/view/${row.id}`}>
              {row.employeeCode}
            </LinkAs>
          );
        },
      },
      {
        key: "fullName",
        label: t("fullName"),
        render: (value) => getLocalizedText(value as any),
      },
      {
        key: "email",
        label: t("email"),
      },
      {
        key: "phone",
        label: t("phone"),
      },
      {
        key: "employmentStatus",
        label: t("status"),
        render: (value) => (
          <Chip className="capitalize" size="sm" variant="flat">
            {value || "active"}
          </Chip>
        ),
      },
      {
        key: "hireDate",
        label: t("hireDate"),
        render: (value) => formatDate(value),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: tDataTable("columns.action"),
        align: "end",
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/workspace/modules/hrm/employees/view/${row.id}`;

          return (
            <ActionMenu
              actions={[
                {
                  key: "view",
                  label: t("view"),
                  href: viewLink,
                },
                {
                  key: "edit",
                  label: t("edit"),
                  href: `/workspace/modules/hrm/employees/edit/${row.id}`,
                },
              ]}
            />
          );
        },
      },
    ],
    [t, tDataTable, getLocalizedText],
  );

  return (
    <div className="space-y-4">
      <ViewListDataTable<EmployeeRow>
        actionsRight={[
          {
            key: "new",
            title: t("newEmployee"),
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/hrm/employees/create",
            },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="employee"
      />
    </div>
  );
}
