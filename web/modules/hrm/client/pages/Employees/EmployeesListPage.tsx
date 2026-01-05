"use client";

import { useTranslations } from "next-intl";
import React from "react";

import { IBaseChip } from "@base/client";
import {
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  IBaseTableColumnDefinition,
} from "@base/client/components";
import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import IBaseLink from "@base/client/components/IBaseLink";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { formatDate } from "@base/client/utils/date/formatDate";
import { Employee } from "@mdl/hrm/client/interface/Employee";

type EmployeeRow = Employee & {
  hireDate?: number | string | null;
  createdAt?: number | string | null;
};

export default function EmployeesListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.employee.list");
  const getLocalizedText = useLocalizedText();

  // React Compiler will automatically optimize this array creation
  const columns: IBaseTableColumnDefinition<EmployeeRow>[] = [
    {
      key: "employeeCode",
      label: t("employeeCode"),
      render: (value, row) => {
        if (!row?.id) return value;

        return (
          <IBaseLink href={`/workspace/modules/hrm/employees/view/${row.id}`}>
            {row.employeeCode}
          </IBaseLink>
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
        <IBaseChip className="capitalize" size="sm" variant="flat">
          {value || "active"}
        </IBaseChip>
      ),
    },
    {
      key: "hireDate",
      label: t("hireDate"),
      render: (value) => formatDate(value),
    },
    {
      key: I_BASE_TABLE_COLUMN_KEY_ACTION,
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
  ];

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
