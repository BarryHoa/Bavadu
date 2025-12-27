"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  IBaseTableColumnDefinition,
  ViewListDataTable,
} from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import { formatDate } from "@base/client/utils/date/formatDate";
import { IBaseChip } from "@base/client";
import { useTranslations } from "next-intl";
import React from "react";
import { CertificateDto } from "@mdl/hrm/client/interface/Certificate";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

type CertificateRow = CertificateDto & {
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function CertificatesListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("hrm.certificates");
  const getLocalizedText = useLocalizedText();

  // React Compiler will automatically optimize this array creation
  const columns: IBaseTableColumnDefinition<CertificateRow>[] = [
      {
        key: "employee",
        label: t("labels.employee"),
        render: (value, row) => {
          if (!row?.id) return null;

          return (
            <LinkAs href={`/workspace/modules/hrm/certificates/view/${row.id}`}>
              {getLocalizedText(row.employee?.fullName) ||
                row.employee?.employeeCode ||
                "—"}
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
        key: "issuer",
        label: t("labels.issuer"),
      },
      {
        key: "certificateNumber",
        label: t("labels.certificateNumber"),
        render: (value) => value || "—",
      },
      {
        key: "issueDate",
        label: t("labels.issueDate"),
        render: (value) => formatDate(value),
      },
      {
        key: "expiryDate",
        label: t("labels.expiryDate"),
        render: (value) => formatDate(value),
      },
      {
        key: "isActive",
        label: t("labels.isActive"),
        render: (value) => (
          <IBaseChip color={value ? "success" : "default"} size="sm" variant="flat">
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
          const viewLink = `/workspace/modules/hrm/certificates/view/${row.id}`;

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
      <ViewListDataTable<CertificateRow>
        actionsRight={[
          {
            key: "new",
            title: t("create"),
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/hrm/certificates/create",
            },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="hrm.certificate"
      />
    </div>
  );
}
