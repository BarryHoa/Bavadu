"use client";

import { IBaseChip, I_BASE_TABLE_COLUMN_KEY_ACTION, IBaseTableColumnDefinition } from "@base/client/components";
import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Position } from "@mdl/hrm/client/interface/Position";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

type PositionRow = Position & {
  createdAt?: number | string | null;
};

export default function PositionsListPage(): React.ReactNode {
  const tIBaseTable = useTranslations("dataTable");
  const t = useTranslations("hrm.position.list");
  const getLocalizedText = useLocalizedText();

  const columns = useMemo<IBaseTableColumnDefinition<PositionRow>[]>(
    () => [
      {
        key: "code",
        label: t("code"),
        render: (value, row) => {
          if (!row?.id) return value;

          return (
            <LinkAs href={`/workspace/modules/hrm/positions/view/${row.id}`}>
              {row.code}
            </LinkAs>
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
        render: (_, row) =>
          getLocalizedText(row.department?.name as any) || "—",
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
        label: tIBaseTable("columns.action"),
        align: "end",
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/workspace/modules/hrm/positions/view/${row.id}`;

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
                  href: `/workspace/modules/hrm/positions/edit/${row.id}`,
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
      <ViewListDataTable<PositionRow>
        actionsRight={[
          {
            key: "new",
            title: t("newPosition"),
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/hrm/positions/create",
            },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="position"
      />
    </div>
  );
}
