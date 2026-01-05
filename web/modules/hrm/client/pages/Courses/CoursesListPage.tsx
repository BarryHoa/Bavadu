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
import { CourseDto } from "@mdl/hrm/client/interface/Course";

type CourseRow = CourseDto & {
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function CoursesListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.courses");
  const getLocalizedText = useLocalizedText();

  // React Compiler will automatically optimize this array creation
  const columns: IBaseTableColumnDefinition<CourseRow>[] = [
    {
      key: "code",
      label: t("labels.code"),
      render: (value, row) => {
        if (!row?.id) return value;

        return (
          <IBaseLink href={`/workspace/modules/hrm/courses/view/${row.id}`}>
            {value}
          </IBaseLink>
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
        <IBaseChip
          color={value ? "success" : "default"}
          size="sm"
          variant="flat"
        >
          {value ? "Active" : "Inactive"}
        </IBaseChip>
      ),
    },
    {
      key: I_BASE_TABLE_COLUMN_KEY_ACTION,
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
  ];

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
