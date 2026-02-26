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
import { useHasPermissions, useLocalizedText } from "@base/client/hooks";
import { Position } from "@mdl/hrm/client/interface/Position";

type PositionRow = Position & {
  createdAt?: number | string | null;
};

export default function PositionsListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.position.list");
  const getLocalizedText = useLocalizedText();
  const { hasPermission: canCreate } = useHasPermissions(["hrm.position.create"]);
  const { hasPermission: canEdit } = useHasPermissions(["hrm.position.update"]);

  // React Compiler will automatically optimize this array creation
  const columns: IBaseTableColumnDefinition<PositionRow>[] = [
    {
      key: "code",
      label: t("code"),
      render: (value, row) => {
        if (!row?.id) return value;

        return (
          <IBaseLink href={`/workspace/modules/hrm/positions/view/${row.id}`}>
            {row.code}
          </IBaseLink>
        );
      },
    },
    {
      key: "name",
      label: t("name"),
      render: (value) => getLocalizedText(value as any),
    },
    {
      key: "department",
      label: t("department"),
      render: (_, row) => getLocalizedText(row.department?.name as any) || "—",
    },
    {
      key: "isActive",
      label: t("status"),
      render: (value) => (
        <IBaseChip className="capitalize" size="sm" variant="flat">
          {value ? "active" : "inactive"}
        </IBaseChip>
      ),
    },
    {
      key: I_BASE_TABLE_COLUMN_KEY_ACTION,
      label: tDataTable("columns.action"),
      align: "end",
      render: (_, row) => {
        if (!row?.id) return null;
        const viewLink = `/workspace/modules/hrm/positions/view/${row.id}`;
        const actions = [
          { key: "view", label: t("view"), href: viewLink },
          ...(canEdit
            ? [{ key: "edit", label: t("edit"), href: `/workspace/modules/hrm/positions/edit/${row.id}` }]
            : []),
        ];
        return <ActionMenu actions={actions} />;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <ViewListDataTable<PositionRow>
        actionsRight={
          canCreate
            ? [
                {
                  key: "new",
                  title: t("newPosition"),
                  type: "link",
                  color: "primary",
                  props: { href: "/workspace/modules/hrm/positions/create" },
                },
              ]
            : undefined
        }
        columns={columns}
        isDummyData={false}
        model="position"
      />
    </div>
  );
}
