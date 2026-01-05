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
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { PayrollDto } from "@mdl/hrm/client/interface/Payroll";

type PayrollRow = PayrollDto & {
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function PayrollListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.payroll");
  const getLocalizedText = useLocalizedText();

  // React Compiler will automatically optimize this array creation
  const columns: IBaseTableColumnDefinition<PayrollRow>[] = [
    {
      key: "employee",
      label: t("labels.employee"),
      render: (value, row) => {
        if (!row?.id) return null;

        return (
          <IBaseLink href={`/workspace/modules/hrm/payroll/view/${row.id}`}>
            {getLocalizedText(row.employee?.fullName) ||
              row.employee?.employeeCode ||
              "—"}
          </IBaseLink>
        );
      },
    },
    {
      key: "payrollPeriod",
      label: t("labels.payrollPeriod"),
      render: (value, row) => row.payrollPeriod?.code || "—",
    },
    {
      key: "grossSalary",
      label: t("labels.grossSalary"),
      render: (value) => (value ? value.toLocaleString() : "—"),
    },
    {
      key: "totalDeductions",
      label: t("labels.totalDeductions"),
      render: (value) => (value ? value.toLocaleString() : "—"),
    },
    {
      key: "netSalary",
      label: t("labels.netSalary"),
      render: (value) => (value ? value.toLocaleString() : "—"),
    },
    {
      key: "status",
      label: t("labels.status"),
      render: (value) => (
        <IBaseChip className="capitalize" size="sm" variant="flat">
          {value || "draft"}
        </IBaseChip>
      ),
    },
    {
      key: I_BASE_TABLE_COLUMN_KEY_ACTION,
      label: tDataTable("columns.action"),
      align: "end",
      render: (_, row) => {
        if (!row?.id) return null;
        const viewLink = `/workspace/modules/hrm/payroll/view/${row.id}`;

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
      <ViewListDataTable<PayrollRow>
        actionsRight={[
          {
            key: "new",
            title: t("create"),
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/hrm/payroll/create",
            },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="hrm.payroll"
      />
    </div>
  );
}
