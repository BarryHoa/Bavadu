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

import { SalesOrderB2C } from "../../interface/SalesOrderB2C";

type SalesOrderB2CRow = SalesOrderB2C & {
  expectedDate?: number | string | null;
  createdAt?: number | string | null;
  completedAt?: number | string | null;
};

export default function SalesOrdersB2CListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("b2cSales.order.create.labels.list");

  const columns = useMemo<DataTableColumn<SalesOrderB2CRow>[]>(
    () => [
      {
        key: "code",
        label: t("code"),
        render: (value, row) => {
          if (!row?.id) return value;

          return (
            <LinkAs href={`/workspace/modules/b2c-sales/view/${row.id}`}>
              {row.code}
            </LinkAs>
          );
        },
      },
      {
        key: "customerName",
        label: t("customerName"),
      },
      {
        key: "status",
        label: t("status"),
        render: (value) => (
          <Chip className="capitalize" size="sm" variant="flat">
            {value || "draft"}
          </Chip>
        ),
      },
      {
        key: "expectedDate",
        label: t("expectedDate"),
        render: (value) => formatDate(value),
      },
      {
        key: "completedAt",
        label: t("completedAt"),
        render: (value) => formatDate(value),
      },
      {
        key: "grandTotal",
        label: t("totalAmount"),
        render: (_, row) =>
          new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: row.currency || "USD",
          }).format(Number(row.grandTotal ?? 0)),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: tDataTable("columns.action"),
        align: "end",
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/workspace/modules/b2c-sales/view/${row.id}`;

          return (
            <ActionMenu
              actions={[
                {
                  key: "view",
                  label: t("view"),
                  href: viewLink,
                },
              ]}
            />
          );
        },
      },
    ],
    [tDataTable],
  );

  return (
    <div className="space-y-4">
      <ViewListDataTable<SalesOrderB2CRow>
        actionsRight={[
          {
            key: "new",
            title: t("newOrder"),
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/b2c-sales/create",
            },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="b2c-sales-order"
      />
    </div>
  );
}
