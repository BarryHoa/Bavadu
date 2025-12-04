"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
} from "@base/client/components/DataTable";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { formatDate } from "@base/client/utils/date/formatDate";
import { Chip } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

type DeliveryRow = {
  id: string;
  orderType: string;
  orderId: string;
  warehouseId?: string | null;
  deliveryDate?: number | string | null;
  reference?: string | null;
  status: string;
  createdAt?: number | string | null;
};

export default function DeliveriesListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");

  const columns = useMemo<DataTableColumn<DeliveryRow>[]>(
    () => [
      {
        key: "reference",
        label: "Reference",
        render: (value, row) => {
          if (!row?.id) return value || "-";
          return (
            <LinkAs
              href={`/workspace/modules/b2b-sales/deliveries/view/${row.id}`}
            >
              {value || row.id.substring(0, 8)}
            </LinkAs>
          );
        },
      },
      {
        key: "orderType",
        label: "Order Type",
        render: (value) => (
          <Chip size="sm" variant="flat" className="capitalize">
            {value || "B2B"}
          </Chip>
        ),
      },
      {
        key: "deliveryDate",
        label: "Delivery Date",
        render: (value) => formatDate(value),
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
        key: "createdAt",
        label: "Created",
        render: (value) => formatDate(value),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: tDataTable("columns.action"),
        align: "end",
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/workspace/modules/b2b-sales/deliveries/view/${row.id}`;
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
      <ViewListDataTable<DeliveryRow>
        model="b2b-sales-delivery"
        columns={columns}
        isDummyData={false}
        actionsRight={[
          {
            key: "new",
            title: "New Delivery",
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/b2b-sales/deliveries/create",
            },
          },
        ]}
      />
    </div>
  );
}
