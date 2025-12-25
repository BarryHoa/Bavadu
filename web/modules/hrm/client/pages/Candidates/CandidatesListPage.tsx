"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
  ViewListDataTable,
} from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import { formatDate } from "@base/client/utils/date/formatDate";
import { Chip } from "@base/client";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { CandidateDto } from "@mdl/hrm/client/interface/Candidate";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

type CandidateRow = CandidateDto & {
  appliedDate?: number | string | null;
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function CandidatesListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.candidates");
  const getLocalizedText = useLocalizedText();

  const columns = useMemo<DataTableColumn<CandidateRow>[]>(
    () => [
      {
        key: "fullName",
        label: t("labels.fullName"),
        render: (value, row) => {
          if (!row?.id) return getLocalizedText(value);

          return (
            <LinkAs href={`/workspace/modules/hrm/candidates/view/${row.id}`}>
              {getLocalizedText(value)}
            </LinkAs>
          );
        },
      },
      {
        key: "email",
        label: t("labels.email"),
      },
      {
        key: "phone",
        label: t("labels.phone"),
      },
      {
        key: "requisition",
        label: t("labels.requisition"),
        render: (value, row) => row.requisition?.requisitionNumber || "—",
      },
      {
        key: "status",
        label: t("labels.status"),
        render: (value) => (
          <Chip className="capitalize" size="sm" variant="flat">
            {value || "applied"}
          </Chip>
        ),
      },
      {
        key: "stage",
        label: t("labels.stage"),
        render: (value) => value || "—",
      },
      {
        key: "rating",
        label: t("labels.rating"),
        render: (value) => (value ? `${value}/5` : "—"),
      },
      {
        key: "appliedDate",
        label: t("labels.appliedDate"),
        render: (value) => formatDate(value),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: tDataTable("columns.action"),
        align: "end",
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/workspace/modules/hrm/candidates/view/${row.id}`;

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
      <ViewListDataTable<CandidateRow>
        actionsRight={[
          {
            key: "new",
            title: t("create"),
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/hrm/candidates/create",
            },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="hrm.candidate"
      />
    </div>
  );
}
