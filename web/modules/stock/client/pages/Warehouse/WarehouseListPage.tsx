"use client";

import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  type DataTableColumn,
} from "@base/client/components/DataTable";
import { Chip } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import type { WarehouseDto } from "../../services/StockService";

const statusColorMap: Record<string, "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  MAINTENANCE: "warning",
  SUSPENDED: "danger",
  CLOSED: "danger",
};

const formatLocation = (warehouse: WarehouseDto) => {
  const parts = [warehouse.address.city, warehouse.address.country].filter(
    (value) => value && value.trim().length > 0
  );
  return parts.length ? parts.join(", ") : "—";
};

const formatStockRange = (warehouse: WarehouseDto) => {
  if (warehouse.maxStock === null || warehouse.maxStock === undefined) {
    return `≥ ${warehouse.minStock}`;
  }
  return `${warehouse.minStock} - ${warehouse.maxStock}`;
};

export default function WarehouseListPage(): React.ReactNode {
  const t = useTranslations("stock.warehouse.list");

  const columns = useMemo<DataTableColumn<WarehouseDto>[]>(
    () => [
      {
        key: "code",
        label: t("columns.code"),
        render: (_, row) => (
          <LinkAs href={`/workspace/modules/stock/warehouses/edit/${row.id}`}>
            {row.code}
          </LinkAs>
        ),
      },
      {
        key: "name",
        label: t("columns.name"),
      },
      {
        key: "typeCode",
        label: t("columns.type"),
      },
      {
        key: "address",
        label: t("columns.location"),
        render: (_, row) => formatLocation(row),
      },
      {
        key: "stockRange",
        label: t("columns.stockRange"),
        render: (_, row) => formatStockRange(row),
      },
      {
        key: "status",
        label: t("columns.status"),
        render: (_, row) => (
          <Chip
            size="sm"
            variant="flat"
            color={statusColorMap[row.status] ?? "warning"}
          >
            {t(`status.${row.status}`)}
          </Chip>
        ),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: t("columns.actions"),
        align: "end",
        render: (_, row) => (
          <LinkAs href={`/workspace/modules/stock/warehouses/edit/${row.id}`}>
            {t("actions.edit")}
          </LinkAs>
        ),
      },
    ],
    [t]
  );

  return (
    <div className="space-y-4">
      <ViewListDataTable<WarehouseDto>
        model="list.stock.warehouse"
        columns={columns}
        isDummyData={false}
        actionsRight={[
          {
            key: "new",
            title: t("actions.new"),
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/stock/warehouses/create",
            },
          },
        ]}
      />
    </div>
  );
}
