"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  IBaseTableColumnDefinition,
} from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { formatDate } from "@base/client/utils/date/formatDate";
import { IBaseChip } from "@base/client";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { PurchaseOrder } from "../../interface/PurchaseOrder";

type PurchaseOrderRow = PurchaseOrder & {
  expectedDate?: number | string | null;
  createdAt?: number | string | null;
};

export default function PurchaseOrdersListPage(): React.ReactNode {
  const t = useTranslations("purchase.orders.list");
  const tDataTable = useTranslations("dataTable");

  const columns = useMemo<IBaseTableColumnDefinition<PurchaseOrderRow>[]>(
    () => [
      {
        key: "code",
        label: t("columns.code"),
        render: (value, row) => {
          if (!row?.id) return value;

          return (
            <LinkAs href={`/workspace/modules/purchase/view/${row.id}`}>
              {row.code}
            </LinkAs>
          );
        },
      },
      {
        key: "vendorName",
        label: t("columns.vendor"),
      },
      {
        key: "status",
        label: t("columns.status"),
        render: (value) => (
          <IBaseChip className="capitalize" size="sm" variant="flat">
            {t(`status.${value || "draft"}`)}
          </IBaseChip>
        ),
      },
      {
        key: "expectedDate",
        label: t("columns.expectedDate"),
        render: (value) => formatDate(value),
      },
      {
        key: "totalAmount",
        label: t("columns.totalAmount"),
        render: (_, row) =>
          new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: row.currency || "USD",
          }).format(Number(row.totalAmount ?? 0)),
      },
      {
        key: I_BASE_TABLE_COLUMN_KEY_ACTION,
        label: tDataTable("columns.action"),
        align: "end",
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/workspace/modules/purchase/view/${row.id}`;

          return (
            <ActionMenu
              actions={[
                {
                  key: "view",
                  label: t("actions.view"),
                  href: viewLink,
                },
              ]}
            />
          );
        },
      },
    ],
    [t, tDataTable],
  );

  return (
    <div className="space-y-4">
      <ViewListDataTable<PurchaseOrderRow>
        actionsRight={[
          {
            key: "new",
            title: t("actions.new"),
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/purchase/create",
            },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="purchase-order"
      />
    </div>
  );
}
