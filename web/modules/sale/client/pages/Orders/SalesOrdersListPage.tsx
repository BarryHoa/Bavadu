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
import { useMemo } from "react";

import { SalesOrder } from "../../interface/SalesOrder";

type SalesOrderRow = SalesOrder & {
  expectedDate?: number | string | null;
  createdAt?: number | string | null;
};

export default function SalesOrdersListPage(): React.ReactNode {
  const columns = useMemo<DataTableColumn<SalesOrderRow>[]>(() => {
    return [
      {
        key: "code",
        label: "Code",
        render: (value, row) => {
          if (!row?.id) return value;
          return (
            <LinkAs href={`/workspace/modules/sale/view/${row.id}`}>
              {row.code}
            </LinkAs>
          );
        },
      },
      {
        key: "customerName",
        label: "Customer",
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
        label: "Expected",
        render: (value) => formatDate(value),
      },
      {
        key: "totalAmount",
        label: "Total",
        render: (_, row) =>
          new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: row.currency || "USD",
          }).format(Number(row.totalAmount ?? 0)),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: "Action",
        align: "end",
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/workspace/modules/sale/view/${row.id}`;
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
    ];
  }, []);

  return (
    <div className="space-y-4">
      <ViewListDataTable<SalesOrderRow>
        model="sale.order"
        columns={columns}
        isDummyData={false}
        actionsRight={[
          {
            key: "new",
            title: "New sales order",
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/sale/create",
            },
          },
        ]}
      />
    </div>
  );
}

