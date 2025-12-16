"use client";

import type { DataTableColumn } from "@base/client/components";
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
import { Button } from "@heroui/button";
import { Card, CardBody, Divider } from "@heroui/react";
import { useMemo } from "react";

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
  const warehouseItems = useMemo<SelectItemOption[]>(
    () =>
      warehouses.map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.code} — ${warehouse.name}`,
      })),
    [warehouses],
  );

  const columns = useMemo<DataTableColumn<StockSummaryItem>[]>(() => {
    return [
      {
        key: "productCode",
        label: "Product Code",
        render: (_, row) => (
          <LinkAs href={`/workspace/modules/product/view/${row.productId}`}>
            {row.productCode}
          </LinkAs>
        ),
      },
      {
        key: "productName",
        label: "Product Name",
        render: (_, row) => (
          <LinkAs href={`/workspace/modules/product/view/${row.productId}`}>
            {row.productName}
          </LinkAs>
        ),
      },
      {
        key: "warehouse",
        label: "Warehouse",
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
        label: "On Hand",
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
        label: "Reserved",
        render: (_, row) => <IBaseDigitViewer value={row.reservedQuantity} />,
      },
    ];
  }, []);

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <IBaseInput
            label="Product ID"
            placeholder="Optional product ID filter"
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
            label="Warehouse"
            selectedKey={filters.warehouseId}
            onSelectionChange={(key) => {
              onFilterChange({
                ...filters,
                warehouseId: key || undefined,
              });
            }}
          />
          <div className="flex items-center gap-2">
            <Button
              color="primary"
              size="sm"
              onPress={() => onFilterChange(filters)}
            >
              Apply
            </Button>
            <Button size="sm" variant="light" onPress={onResetFilters}>
              Reset
            </Button>
          </div>
        </div>

        <Divider />

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
      </CardBody>
    </Card>
  );
}
