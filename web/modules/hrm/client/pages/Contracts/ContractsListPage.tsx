"use client";

import { IBaseChip, I_BASE_TABLE_COLUMN_KEY_ACTION, IBaseTableColumnDefinition } from "@base/client/components";
import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Contract } from "@mdl/hrm/client/interface/Contract";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

type ContractRow = Contract & {
  startDate?: number | string | null;
  createdAt?: number | string | null;
};

export default function ContractsListPage(): React.ReactNode {
  const tIBaseTable = useTranslations("dataTable");
  const t = useTranslations("hrm.contract.list");
  const getLocalizedText = useLocalizedText();

  const columns = useMemo<IBaseTableColumnDefinition<ContractRow>[]>(
    () => [
      {
        key: "contractNumber",
        label: t("contractNumber"),
        render: (value, row) => {
          if (!row?.id) return value;

          return (
            <LinkAs href={`/workspace/modules/hrm/contracts/view/${row.id}`}>
              {row.contractNumber}
            </LinkAs>
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
        label: tIBaseTable("columns.action"),
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
    ],
    [t, tIBaseTable, getLocalizedText],
  );

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
