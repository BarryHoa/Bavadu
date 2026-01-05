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
import { formatDate } from "@base/client/utils/date/formatDate";
import { PerformanceReviewDto } from "@mdl/hrm/client/interface/PerformanceReview";

type PerformanceReviewRow = PerformanceReviewDto & {
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function PerformanceReviewsListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.performanceReviews");
  const getLocalizedText = useLocalizedText();

  // React Compiler will automatically optimize this array creation
  const columns: IBaseTableColumnDefinition<PerformanceReviewRow>[] = [
    {
      key: "employee",
      label: t("labels.employee"),
      render: (value, row) => {
        if (!row?.id) return null;

        return (
          <IBaseLink
            href={`/workspace/modules/hrm/performance-reviews/view/${row.id}`}
          >
            {getLocalizedText(row.employee?.fullName) ||
              row.employee?.employeeCode ||
              "—"}
          </IBaseLink>
        );
      },
    },
    {
      key: "reviewType",
      label: t("labels.reviewType"),
      render: (value) => value || "—",
    },
    {
      key: "reviewPeriod",
      label: t("labels.reviewPeriod"),
      render: (value) => value || "—",
    },
    {
      key: "reviewDate",
      label: t("labels.reviewDate"),
      render: (value) => formatDate(value),
    },
    {
      key: "reviewer",
      label: t("labels.reviewer"),
      render: (value, row) =>
        getLocalizedText(row.reviewer?.fullName) ||
        row.reviewer?.employeeCode ||
        "—",
    },
    {
      key: "overallRating",
      label: t("labels.overallRating"),
      render: (value) => (value ? `${value}/5` : "—"),
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
        const viewLink = `/workspace/modules/hrm/performance-reviews/view/${row.id}`;

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
      <ViewListDataTable<PerformanceReviewRow>
        actionsRight={[
          {
            key: "new",
            title: t("create"),
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/hrm/performance-reviews/create",
            },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="hrm.performance-review"
      />
    </div>
  );
}
