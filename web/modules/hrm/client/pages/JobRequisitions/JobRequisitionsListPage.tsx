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
import { JobRequisitionDto } from "@mdl/hrm/client/interface/JobRequisition";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

type JobRequisitionRow = JobRequisitionDto & {
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function JobRequisitionsListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.jobRequisitions");
  const getLocalizedText = useLocalizedText();

  const columns = useMemo<DataTableColumn<JobRequisitionRow>[]>(
    () => [
      {
        key: "requisitionNumber",
        label: t("labels.requisitionNumber"),
        render: (value, row) => {
          if (!row?.id) return value;
          return (
            <LinkAs href={`/workspace/modules/hrm/job-requisitions/view/${row.id}`}>
              {value}
            </LinkAs>
          );
        },
      },
      {
        key: "title",
        label: t("labels.title"),
        render: (value) => getLocalizedText(value),
      },
      {
        key: "department",
        label: t("labels.department"),
        render: (value, row) => getLocalizedText(row.department?.name),
      },
      {
        key: "position",
        label: t("labels.position"),
        render: (value, row) => getLocalizedText(row.position?.name),
      },
      {
        key: "numberOfOpenings",
        label: t("labels.numberOfOpenings"),
      },
      {
        key: "priority",
        label: t("labels.priority"),
        render: (value) => (
          <Chip size="sm" variant="flat" className="capitalize">
            {value || "normal"}
          </Chip>
        ),
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
        key: "openedDate",
        label: t("labels.openedDate"),
        render: (value) => formatDate(value),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: tDataTable("columns.action"),
        align: "end",
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/workspace/modules/hrm/job-requisitions/view/${row.id}`;
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
      <ViewListDataTable<JobRequisitionRow>
        model="hrm.job-requisition"
        columns={columns}
        isDummyData={false}
        actionsRight={[
          {
            key: "new",
            title: t("create"),
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/hrm/job-requisitions/create",
            },
          },
        ]}
      />
    </div>
  );
}

