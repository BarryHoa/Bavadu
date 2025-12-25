"use client";

import type { WarehouseDto } from "../../services/StockService";

import {
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  type IBaseTableColumnDefinition,
} from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { IBaseChip } from "@base/client";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const statusColorMap: Record<string, "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  MAINTENANCE: "warning",
  SUSPENDED: "danger",
  CLOSED: "danger",
};

const formatLocation = (warehouse: WarehouseDto) => {
  if (!warehouse.address || warehouse.address.length === 0) {
    return "—";
  }
  const address = warehouse.address[0];
  const getLocalizedName = (name: any): string => {
    if (!name) return "";
    if (typeof name === "string") return name;

    return name.vi || name.en || "";
  };
  const parts = [
    address.administrativeUnits?.find((u) => u.level === 2)
      ? getLocalizedName(
          address.administrativeUnits.find((u) => u.level === 2)?.name,
        )
      : undefined,
    address.country ? getLocalizedName(address.country.name) : undefined,
  ].filter(
    (value): value is string =>
      Boolean(value) && typeof value === "string" && value.trim().length > 0,
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
  const tDataTable = useTranslations("dataTable");

  const columns = useMemo<IBaseTableColumnDefinition<WarehouseDto>[]>(
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
          <IBaseChip
            color={statusColorMap[row.status] ?? "warning"}
            size="sm"
            variant="flat"
          >
            {t(`status.${row.status}`)}
          </IBaseChip>
        ),
      },
      {
        key: I_BASE_TABLE_COLUMN_KEY_ACTION,
        label: tDataTable("columns.action"),
        align: "end",
        render: (_, row) => (
          <LinkAs href={`/workspace/modules/stock/warehouses/edit/${row.id}`}>
            {t("actions.edit")}
          </LinkAs>
        ),
      },
    ],
    [t, tDataTable],
  );

  return (
    <div className="space-y-4">
      <ViewListDataTable<WarehouseDto>
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
        columns={columns}
        isDummyData={false}
        model="stock-warehouse"
      />
    </div>
  );
}
