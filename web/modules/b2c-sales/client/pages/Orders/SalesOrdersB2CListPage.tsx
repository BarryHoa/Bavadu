"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
} from "@base/client/components/DataTable";
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

  const columns = useMemo<DataTableColumn<SalesOrderB2CRow>[]>(
    () => [
      {
        key: "code",
        label: "Code",
        render: (value, row) => {
          if (!row?.id) return value;
          return (
            <LinkAs href={`/workspace/modules/b2c-sales/orders-b2c/view/${row.id}`}>
              {row.code}
            </LinkAs>
          );
        },
      },
      {
        key: "customerName",
        label: "Customer Name",
      },
      {
        key: "status",
        label: "Status",
        render: (value) => (
          <Chip size="sm" variant="flat" className="capitalize">
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
        key: "completedAt",
        label: "Completed At",
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
          const viewLink = `/workspace/modules/b2c-sales/orders-b2c/view/${row.id}`;
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
    [tDataTable]
  );

  return (
    <div className="space-y-4">
      <ViewListDataTable<SalesOrderB2CRow>
        model="list.b2c-sales.order"
        columns={columns}
        isDummyData={false}
        actionsRight={[
          {
            key: "new",
            title: "New B2C Order",
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/b2c-sales/orders-b2c/create",
            },
          },
        ]}
      />
    </div>
  );
}

