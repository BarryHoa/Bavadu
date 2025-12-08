"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
} from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { formatDate } from "@base/client/utils/date/formatDate";
import { Chip } from "@heroui/react";
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

  const columns = useMemo<DataTableColumn<PurchaseOrderRow>[]>(
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
          <Chip size="sm" variant="flat" className="capitalize">
            {t(`status.${value || "draft"}`)}
          </Chip>
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
        key: DATA_TABLE_COLUMN_KEY_ACTION,
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
    [t, tDataTable]
  );

  return (
    <div className="space-y-4">
      <ViewListDataTable<PurchaseOrderRow>
        model="purchase-order"
        columns={columns}
        isDummyData={false}
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
      />
    </div>
  );
}
