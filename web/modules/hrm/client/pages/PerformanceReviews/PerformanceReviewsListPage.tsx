"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
  ViewListDataTable,
} from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import { formatDate } from "@base/client/utils/date/formatDate";
import { Chip } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { PerformanceReviewDto } from "@mdl/hrm/client/interface/PerformanceReview";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

type PerformanceReviewRow = PerformanceReviewDto & {
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function PerformanceReviewsListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.performanceReviews");
  const getLocalizedText = useLocalizedText();

  const columns = useMemo<DataTableColumn<PerformanceReviewRow>[]>(
    () => [
      {
        key: "employee",
        label: t("labels.employee"),
        render: (value, row) => {
          if (!row?.id) return null;
          return (
            <LinkAs href={`/workspace/modules/hrm/performance-reviews/view/${row.id}`}>
              {getLocalizedText(row.employee?.fullName) || row.employee?.employeeCode || "—"}
            </LinkAs>
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
        render: (value, row) => getLocalizedText(row.reviewer?.fullName) || row.reviewer?.employeeCode || "—",
      },
      {
        key: "overallRating",
        label: t("labels.overallRating"),
        render: (value) => value ? `${value}/5` : "—",
      },
      {
        key: "status",
        label: t("labels.status"),
        render: (value) => (
          <Chip size="sm" variant="flat" className="capitalize">
            {value || "draft"}
          </Chip>
        ),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
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
    ],
    [tDataTable, t, getLocalizedText]
  );

  return (
    <div className="space-y-4">
      <ViewListDataTable<PerformanceReviewRow>
        model="hrm.performance-review"
        columns={columns}
        isDummyData={false}
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
      />
    </div>
  );
}

