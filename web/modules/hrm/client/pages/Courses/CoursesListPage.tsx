"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
  ViewListDataTable,
} from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import { Chip } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { CourseDto } from "@mdl/hrm/client/interface/Course";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

type CourseRow = CourseDto & {
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function CoursesListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.courses");
  const getLocalizedText = useLocalizedText();

  const columns = useMemo<DataTableColumn<CourseRow>[]>(
    () => [
      {
        key: "code",
        label: t("labels.code"),
        render: (value, row) => {
          if (!row?.id) return value;

          return (
            <LinkAs href={`/workspace/modules/hrm/courses/view/${row.id}`}>
              {value}
            </LinkAs>
          );
        },
      },
      {
        key: "name",
        label: t("labels.name"),
        render: (value) => getLocalizedText(value),
      },
      {
        key: "category",
        label: t("labels.category"),
        render: (value) => value || "—",
      },
      {
        key: "duration",
        label: t("labels.duration"),
        render: (value) => (value ? `${value} hours` : "—"),
      },
      {
        key: "format",
        label: t("labels.format"),
        render: (value) => value || "—",
      },
      {
        key: "isActive",
        label: t("labels.isActive"),
        render: (value) => (
          <Chip color={value ? "success" : "default"} size="sm" variant="flat">
            {value ? "Active" : "Inactive"}
          </Chip>
        ),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: tDataTable("columns.action"),
        align: "end",
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/workspace/modules/hrm/courses/view/${row.id}`;

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
    ],
    [tDataTable, t, getLocalizedText],
  );

  return (
    <div className="space-y-4">
      <ViewListDataTable<CourseRow>
        actionsRight={[
          {
            key: "new",
            title: t("create"),
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/hrm/courses/create",
            },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="hrm.course"
      />
    </div>
  );
}
