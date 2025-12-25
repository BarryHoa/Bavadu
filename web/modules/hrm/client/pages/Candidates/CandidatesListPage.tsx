"use client";

import {
  IBaseChip,
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  IBaseTableColumnDefinition,
  ViewListDataTable,
} from "@base/client/components";
import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import LinkAs from "@base/client/components/LinkAs";
import { formatDate } from "@base/client/utils/date/formatDate";
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
  const tIBaseTable = useTranslations("dataTable");
  const t = useTranslations("hrm.candidates");
  const getLocalizedText = useLocalizedText();

  const columns = useMemo<IBaseTableColumnDefinition<CandidateRow>[]>(
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
          <IBaseChip className="capitalize" size="sm" variant="flat">
            {value || "applied"}
          </IBaseChip>
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
        key: I_BASE_TABLE_COLUMN_KEY_ACTION,
        label: tIBaseTable("columns.action"),
        align: "end",
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/workspace/modules/hrm/candidates/view/${row.id}`;

          return (
            <ActionMenu
              actions={[
                {
                  key: "view",
                  label: tIBaseTable("columns.view"),
                  href: viewLink,
                },
              ]}
            />
          );
        },
      },
    ],
    [tIBaseTable, t, getLocalizedText],
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
