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
import { useHasPermissions, useLocalizedText } from "@base/client/hooks";
import { formatDate } from "@base/client/utils/date/formatDate";
import { CandidateDto } from "@mdl/hrm/client/interface/Candidate";

type CandidateRow = CandidateDto & {
  appliedDate?: number | string | null;
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function CandidatesListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.candidates");
  const getLocalizedText = useLocalizedText();
  const { hasPermission: canCreate } = useHasPermissions(["hrm.candidate.create"]);

  // React Compiler will automatically optimize this array creation
  const columns: IBaseTableColumnDefinition<CandidateRow>[] = [
    {
      key: "fullName",
      label: t("labels.fullName"),
      render: (value, row) => {
        if (!row?.id) return getLocalizedText(value);

        return (
          <IBaseLink href={`/workspace/modules/hrm/candidates/view/${row.id}`}>
            {getLocalizedText(value)}
          </IBaseLink>
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
  ];

  return (
    <div className="space-y-4">
      <ViewListDataTable<CandidateRow>
        actionsRight={
          canCreate
            ? [
                {
                  key: "new",
                  title: t("create"),
                  type: "link",
                  color: "primary",
                  props: { href: "/workspace/modules/hrm/candidates/create" },
                },
              ]
            : undefined
        }
        columns={columns}
        isDummyData={false}
        model="hrm.candidate"
      />
    </div>
  );
}
