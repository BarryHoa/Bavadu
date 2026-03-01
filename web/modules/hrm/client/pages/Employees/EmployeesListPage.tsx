"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React from "react";

import { IBaseChip } from "@base/client";
import {
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  IBaseTableColumnDefinition,
} from "@base/client/components";
import IBaseLink from "@base/client/components/IBaseLink";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { useLocalizedText, usePermission } from "@base/client/hooks";
import { formatDate } from "@base/client/utils/date/formatDate";
import { Employee } from "@mdl/hrm/client/interface/Employee";

import EmployeeActionMenu from "./components/EmployeeActionMenu";

/** Hiển thị phần tử đầu nếu value là array. */
function firstOf(value: unknown): string | number | null | undefined {
  if (Array.isArray(value)) return (value[0] as string | undefined) ?? null;

  return value as string | number | null | undefined;
}

type EmployeeRow = Employee & {
  userId?: string | null;
  code?: string;
  fullName?: unknown;
  firstName?: string | null;
  lastName?: string | null;
  emails?: string[] | null;
  phones?: string[] | null;
  position?: { id: string; name?: unknown } | null;
  department?: { id: string; name?: unknown } | null;
  status?: string | null;
  type?: string | null;
  hireDate?: number | string | null;
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function EmployeesListPage(): React.ReactNode {
  const queryClient = useQueryClient();
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.employee.list");
  const getLocalizedText = useLocalizedText();
  const { hasPermission } = usePermission();
  const canCreate = hasPermission("hrm.employee.create");

  const handlePermissionChange = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["hrm-employees"] });
  }, [queryClient]);

  const columns: IBaseTableColumnDefinition<EmployeeRow>[] = [
    {
      key: "code",
      label: t("employeeCode"),
      render: (value, row) => {
        const code = (row?.code ?? row?.employeeCode ?? value) as string;

        if (!row?.id) return code;

        return (
          <IBaseLink href={`/workspace/modules/hrm/employees/view/${row.id}`}>
            {code}
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
      key: "firstName",
      label: t("firstName"),
    },
    {
      key: "lastName",
      label: t("lastName"),
    },
    {
      key: "emails",
      label: t("email"),
      render: (value) => firstOf(value) ?? "—",
    },
    {
      key: "phones",
      label: t("phone"),
      render: (value) => firstOf(value) ?? "—",
    },
    {
      key: "position",
      label: t("position"),
      render: (_, row) =>
        getLocalizedText(row?.position?.name as any) ??
        row?.position?.name ??
        "—",
    },
    {
      key: "department",
      label: t("department"),
      render: (_, row) =>
        getLocalizedText(row?.department?.name as any) ??
        row?.department?.name ??
        "—",
    },
    {
      key: "status",
      label: t("status"),
      render: (value) => (
        <IBaseChip className="capitalize" size="sm" variant="flat">
          {value || "active"}
        </IBaseChip>
      ),
    },
    {
      key: "type",
      label: t("type"),
      render: (value) => (value ? String(value) : "—"),
    },
    {
      key: "hireDate",
      label: t("hireDate"),
      render: (value) => formatDate(value),
    },
    {
      key: "createdAt",
      label: t("createdAt"),
      render: (value) => formatDate(value),
    },
    {
      key: "updatedAt",
      label: t("updatedAt"),
      render: (value) => formatDate(value),
    },
    {
      key: I_BASE_TABLE_COLUMN_KEY_ACTION,
      label: tDataTable("columns.action"),
      align: "end",
      render: (_, row) => {
        return (
          <EmployeeActionMenu
            row={row as any}
            onPermissionChange={handlePermissionChange}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <ViewListDataTable<EmployeeRow>
        actionsRight={
          canCreate
            ? [
                {
                  key: "new",
                  title: t("newEmployee"),
                  type: "link",
                  color: "primary",
                  props: {
                    href: "/workspace/modules/hrm/employees/create",
                  },
                },
              ]
            : undefined
        }
        columns={columns}
        isDummyData={false}
        model="employee"
        scrollHeight={{
          maxHeight: "calc(100vh - 165px)",
        }}
      />
    </div>
  );
}
