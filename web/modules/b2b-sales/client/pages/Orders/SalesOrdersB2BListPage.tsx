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

import { SalesOrderB2B } from "../../interface/SalesOrderB2B";

type SalesOrderB2BRow = SalesOrderB2B & {
  expectedDate?: number | string | null;
  createdAt?: number | string | null;
};

export default function SalesOrdersB2BListPage(): React.ReactNode {
  const t = useTranslations("sale.ordersB2B.list");
  const tDataTable = useTranslations("dataTable");

  const columns = useMemo<DataTableColumn<SalesOrderB2BRow>[]>(
    () => [
      {
        key: "code",
        label: "Code",
        render: (value, row) => {
          if (!row?.id) return value;

          return (
            <LinkAs href={`/workspace/modules/b2b-sales/view/${row.id}`}>
              {row.code}
            </LinkAs>
          );
        },
      },
      {
        key: "companyName",
        label: "Company Name",
      },
      {
        key: "status",
        label: "Status",
        render: (value) => (
          <Chip className="capitalize" size="sm" variant="flat">
            {value || "draft"}
          </Chip>
        ),
      },
      {
        key: "expectedDate",
        label: "Expected Date",
        render: (value) => formatDate(value),
      },
      {
        key: "grandTotal",
        label: "Total Amount",
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
          const viewLink = `/workspace/modules/b2b-sales/view/${row.id}`;

          return (
            <ActionMenu
              actions={[
                {
                  key: "view",
                  label: "View",
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
      <ViewListDataTable<SalesOrderB2BRow>
        actionsRight={[
          {
            key: "new",
            title: "New Order",
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/b2b-sales/create",
            },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="b2b-sales-order"
      />
    </div>
  );
}
