"use client";

import { IBaseChip, I_BASE_TABLE_COLUMN_KEY_ACTION, IBaseTableColumnDefinition } from "@base/client/components";
import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { formatDate } from "@base/client/utils/date/formatDate";
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
  const tIBaseTable = useTranslations("dataTable");

  const columns = useMemo<IBaseTableColumnDefinition<DeliveryRow>[]>(
    () => [
      {
        key: "reference",
        label: "Reference",
        render: (value, row) => {
          if (!row?.id) return value || "-";

          return (
            <LinkAs
              href={`/workspace/modules/b2c-sales/deliveries/view/${row.id}`}
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
          <IBaseChip className="capitalize" size="sm" variant="flat">
            {value || "B2B"}
          </IBaseChip>
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
          <IBaseChip className="capitalize" size="sm" variant="flat">
            {value || "draft"}
          </IBaseChip>
        ),
      },
      {
        key: "createdAt",
        label: "Created",
        render: (value) => formatDate(value),
      },
      {
        key: I_BASE_TABLE_COLUMN_KEY_ACTION,
        label: tIBaseTable("columns.action"),
        align: "end",
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/workspace/modules/b2c-sales/deliveries/view/${row.id}`;

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
    [tIBaseTable],
  );

  return (
    <div className="space-y-4">
      <ViewListDataTable<DeliveryRow>
        actionsRight={[
          {
            key: "new",
            title: "New Delivery",
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/b2c-sales/deliveries/create",
            },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="b2c-sales-delivery"
      />
    </div>
  );
}
