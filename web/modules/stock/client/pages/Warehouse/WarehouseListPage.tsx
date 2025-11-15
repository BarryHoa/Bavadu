"use client";

import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  type DataTableColumn,
} from "@base/client/components/DataTable";
import { Chip } from "@heroui/react";
import { useMemo } from "react";

import type { WarehouseDto } from "../../services/StockService";

const statusColorMap: Record<string, "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  MAINTENANCE: "warning",
  SUSPENDED: "danger",
  CLOSED: "danger",
};

const formatStatusLabel = (status: string) =>
  status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^[a-z]/, (char) => char.toUpperCase());

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

  const columns = useMemo<DataTableColumn<WarehouseDto>[]>(() => {
    return [
      {
        key: "code",
        label: "Code",
        render: (_, row) => (
          <LinkAs href={`/workspace/modules/stock/warehouses/edit/${row.id}`}>
            {row.code}
          </LinkAs>
        ),
      },
      {
        key: "name",
        label: "Name",
      },
      {
        key: "typeCode",
        label: "Type",
      },
      {
        key: "address",
        label: "Location",
        render: (_, row) => formatLocation(row),
      },
      {
        key: "stockRange",
        label: "Stock Range",
        render: (_, row) => formatStockRange(row),
      },
      {
        key: "status",
        label: "Status",
        render: (_, row) => (
          <Chip
            size="sm"
            variant="flat"
            color={statusColorMap[row.status] ?? "warning"}
          >
            {formatStatusLabel(row.status)}
          </Chip>
        ),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: "Actions",
        align: "end",
        render: (_, row) => (
          <LinkAs href={`/workspace/modules/stock/warehouses/edit/${row.id}`}>
            Edit
          </LinkAs>
        ),
      },
    ];
  }, []);

  return (
    <div className="space-y-4">
      <ViewListDataTable<WarehouseDto>
        model="stock.warehouse"
        columns={columns}
        isDummyData={false}
        actionsRight={[
          {
            key: "new",
            title: "New warehouse",
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
