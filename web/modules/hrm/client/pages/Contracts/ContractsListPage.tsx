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
import { Contract } from "@mdl/hrm/client/interface/Contract";

type ContractRow = Contract & {
  startDate?: number | string | null;
  createdAt?: number | string | null;
};

export default function ContractsListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.contract.list");
  const getLocalizedText = useLocalizedText();

  // React Compiler will automatically optimize this array creation
  const columns: IBaseTableColumnDefinition<ContractRow>[] = [
    {
      key: "contractNumber",
      label: t("contractNumber"),
      render: (value, row) => {
        if (!row?.id) return value;

        return (
          <IBaseLink href={`/workspace/modules/hrm/contracts/view/${row.id}`}>
            {row.contractNumber}
          </IBaseLink>
        );
      },
    },
    {
      key: "employee",
      label: t("employee"),
      render: (_, row) =>
        getLocalizedText(row.employee?.fullName as any) ||
        row.employee?.employeeCode ||
        "—",
    },
    {
      key: "contractType",
      label: t("contractType"),
    },
    {
      key: "status",
      label: t("status"),
      render: (value) => (
        <IBaseChip className="capitalize" size="sm" variant="flat">
          {value || "draft"}
        </IBaseChip>
      ),
    },
    {
      key: "startDate",
      label: t("startDate"),
      render: (value) => value || "—",
    },
    {
      key: "baseSalary",
      label: t("baseSalary"),
      render: (_, row) =>
        new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: row.currency || "VND",
        }).format(row.baseSalary),
    },
    {
      key: I_BASE_TABLE_COLUMN_KEY_ACTION,
      label: tDataTable("columns.action"),
      align: "end",
      render: (_, row) => {
        if (!row?.id) return null;
        const viewLink = `/workspace/modules/hrm/contracts/view/${row.id}`;

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
                href: `/workspace/modules/hrm/contracts/edit/${row.id}`,
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <ViewListDataTable<ContractRow>
        actionsRight={[
          {
            key: "new",
            title: t("newContract"),
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/hrm/contracts/create",
            },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="contract"
      />
    </div>
  );
}
