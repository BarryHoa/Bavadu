"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
} from "@base/client/components/DataTable";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { formatDate } from "@base/client/ultils/date/formatDate";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/react";
import { useMemo } from "react";

import { PurchaseOrder } from "../../interface/PurchaseOrder";

type PurchaseOrderRow = PurchaseOrder & {
  expectedDate?: number | string | null;
  createdAt?: number | string | null;
};

export default function PurchaseOrdersListPage(): React.ReactNode {
  const columns = useMemo<DataTableColumn<PurchaseOrderRow>[]>(() => {
    return [
      {
        key: "code",
        label: "Code",
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
        label: "Vendor",
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
          const viewLink = `/workspace/modules/purchase/view/${row.id}`;
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
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          color="primary"
          size="sm"
          as={LinkAs as any}
          href="/workspace/modules/purchase/create"
        >
          New purchase order
        </Button>
      </div>

      <ViewListDataTable<PurchaseOrderRow>
        model="purchase.order"
        columns={columns}
        isDummyData={false}
      />
    </div>
  );
}
