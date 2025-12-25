"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
} from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { Chip } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Department } from "@mdl/hrm/client/interface/Department";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

type DepartmentRow = Department & {
  createdAt?: number | string | null;
};

export default function DepartmentsListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.department.list");
  const getLocalizedText = useLocalizedText();

  const columns = useMemo<DataTableColumn<DepartmentRow>[]>(
    () => [
      {
        key: "code",
        label: t("code"),
        render: (value, row) => {
          if (!row?.id) return value;

          return (
            <LinkAs href={`/workspace/modules/hrm/departments/view/${row.id}`}>
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
        key: "level",
        label: t("level"),
      },
      {
        key: "isActive",
        label: t("status"),
        render: (value) => (
          <Chip className="capitalize" size="sm" variant="flat">
            {value ? "active" : "inactive"}
          </Chip>
        ),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: tDataTable("columns.action"),
        align: "end",
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/workspace/modules/hrm/departments/view/${row.id}`;

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
                  href: `/workspace/modules/hrm/departments/edit/${row.id}`,
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
      <ViewListDataTable<DepartmentRow>
        actionsRight={[
          {
            key: "new",
            title: t("newDepartment"),
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/hrm/departments/create",
            },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="department"
      />
    </div>
  );
}
