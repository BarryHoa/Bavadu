"use client";

import {
  IBaseChip,
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  IBaseTableColumnDefinition,
  ViewListDataTable,
} from "@base/client/components";
import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import LinkAs from "@base/client/components/LinkAs";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { PayrollDto } from "@mdl/hrm/client/interface/Payroll";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

type PayrollRow = PayrollDto & {
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function PayrollListPage(): React.ReactNode {
  const tIBaseTable = useTranslations("dataTable");
  const t = useTranslations("hrm.payroll");
  const getLocalizedText = useLocalizedText();

  const columns = useMemo<IBaseTableColumnDefinition<PayrollRow>[]>(
    () => [
      {
        key: "employee",
        label: t("labels.employee"),
        render: (value, row) => {
          if (!row?.id) return null;

          return (
            <LinkAs href={`/workspace/modules/hrm/payroll/view/${row.id}`}>
              {getLocalizedText(row.employee?.fullName) ||
                row.employee?.employeeCode ||
                "—"}
            </LinkAs>
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
        label: tIBaseTable("columns.action"),
        align: "end",
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/workspace/modules/hrm/payroll/view/${row.id}`;

          return (
            <ActionMenu
              actions={[
                {
                  key: "view",
                  label: tIBaseTable("columns.view"),
                  href: viewLink,
                },
              ]}
            />
          );
        },
      },
    ],
    [tIBaseTable, t, getLocalizedText],
  );

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
