"use client";

import type { IBaseTableColumnDefinition } from "@base/client/components";
import type {
  StockSummaryItem,
  WarehouseDto,
} from "../../../services/StockService";
import type { StockFilters } from "../types";

import {
  IBaseDigitViewer,
  IBaseInput,
  IBaseSingleSelect,
  SelectItemOption,
} from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { IBaseButton } from "@base/client";
import { IBaseCard, IBaseCardBody, IBaseDivider } from "@base/client";
import React from "react";
import { useTranslations } from "next-intl";

interface StockSummarySectionProps {
  filters: StockFilters;
  appliedFilters: StockFilters;
  onFilterChange: (filters: StockFilters) => void;
  onResetFilters: () => void;
  warehouses: WarehouseDto[];
  warehousesLoading: boolean;
}

export default function StockSummarySection({
  filters,
  appliedFilters,
  onFilterChange,
  onResetFilters,
  warehouses,
  warehousesLoading,
}: StockSummarySectionProps) {
  const t = useTranslations("stock.dashboard.stockSummary");
  // React Compiler will automatically optimize these computations
  const warehouseItems: SelectItemOption[] = warehouses.map((warehouse) => ({
    value: warehouse.id,
    label: `${warehouse.code} — ${warehouse.name}`,
  }));

  const columns: IBaseTableColumnDefinition<StockSummaryItem>[] = [
      {
        key: "productCode",
        label: t("columns.productCode"),
        render: (_, row) => (
          <LinkAs href={`/workspace/modules/product/view/${row.productId}`}>
            {row.productCode}
          </LinkAs>
        ),
      },
      {
        key: "productName",
        label: t("columns.productName"),
        render: (_, row) => (
          <LinkAs href={`/workspace/modules/product/view/${row.productId}`}>
            {row.productName}
          </LinkAs>
        ),
      },
      {
        key: "warehouse",
        label: t("columns.warehouse"),
        render: (_, row) => (
          <LinkAs
            href={`/workspace/modules/stock/warehouses/edit/${row.warehouseId}`}
          >
            {`${row.warehouseCode} - ${row.warehouseName}`}
          </LinkAs>
        ),
      },
      {
        key: "quantity",
        label: t("columns.onHand"),
        render: (_, row) => {
          let colorClass = "";

          if (row.quantity <= 0) {
            colorClass = "text-danger";
          } else if (
            row.minStock !== null &&
            row.quantity <= Number(row.minStock)
          ) {
            colorClass = "text-warning-600";
          }

          return (
            <IBaseDigitViewer className={colorClass} value={row.quantity} />
          );
        },
      },
      {
        key: "reservedQuantity",
        label: t("columns.reserved"),
        render: (_, row) => <IBaseDigitViewer value={row.reservedQuantity} />,
      },
    ];

  return (
    <IBaseCard>
      <IBaseCardBody className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <IBaseInput
            label={t("filters.productId.label")}
            placeholder={t("filters.productId.placeholder")}
            value={filters.productId ?? ""}
            onValueChange={(value) =>
              onFilterChange({
                ...filters,
                productId: value || undefined,
              })
            }
          />
          <IBaseSingleSelect
            className="max-w-xs"
            isDisabled={warehousesLoading || warehouseItems.length === 0}
            items={warehouseItems}
            label={t("filters.warehouse.label")}
            selectedKey={filters.warehouseId}
            onSelectionChange={(key) => {
              onFilterChange({
                ...filters,
                warehouseId: key || undefined,
              });
            }}
          />
          <div className="flex items-center gap-2">
            <IBaseButton
              color="primary"
              size="sm"
              onPress={() => onFilterChange(filters)}
            >
              {t("filters.apply")}
            </IBaseButton>
            <IBaseButton size="sm" variant="light" onPress={onResetFilters}>
              {t("filters.reset")}
            </IBaseButton>
          </div>
        </div>

        <IBaseDivider />

        <ViewListDataTable<StockSummaryItem & { id: string }>
          columnVisibility={{ hidden: true }}
          columns={columns}
          favorite={{ hidden: true }}
          filter={{ hidden: true }}
          groupBy={{ hidden: true }}
          isDummyData={false}
          model="stock-summary"
          rowKey="id"
          search={{ hidden: true }}
        />
      </IBaseCardBody>
    </IBaseCard>
  );
}
