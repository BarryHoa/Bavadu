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
import { Department } from "@mdl/hrm/client/interface/Department";

type DepartmentRow = Department & {
  createdAt?: number | string | null;
};

export default function DepartmentsListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.department.list");
  const getLocalizedText = useLocalizedText();
  const { hasPermission: canCreate } = useHasPermissions(["hrm.department.create"]);
  const { hasPermission: canEdit } = useHasPermissions(["hrm.department.update"]);

  // React Compiler will automatically optimize this array creation
  const columns: IBaseTableColumnDefinition<DepartmentRow>[] = [
    {
      key: "code",
      label: t("code"),
      render: (value, row) => {
        if (!row?.id) return value;

        return (
          <IBaseLink href={`/workspace/modules/hrm/departments/view/${row.id}`}>
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
      key: "level",
      label: t("level"),
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
        const viewLink = `/workspace/modules/hrm/departments/view/${row.id}`;
        const actions = [
          { key: "view", label: t("view"), href: viewLink },
          ...(canEdit
            ? [{ key: "edit", label: t("edit"), href: `/workspace/modules/hrm/departments/edit/${row.id}` }]
            : []),
        ];

        return (
          <ActionMenu
            actions={actions}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <ViewListDataTable<DepartmentRow>
        actionsRight={
          canCreate
            ? [
                {
                  key: "new",
                  title: t("newDepartment"),
                  type: "link",
                  color: "primary",
                  props: {
                    href: "/workspace/modules/hrm/departments/create",
                  },
                },
              ]
            : undefined
        }
        columns={columns}
        isDummyData={false}
        model="department"
      />
    </div>
  );
}
