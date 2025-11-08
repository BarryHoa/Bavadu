"use client";
import { DataTableColumn } from "@/module-base/client/components/DataTable";
import ViewListDataTable from "@/module-base/client/components/ViewListDataTable";
import { useLocalizedText } from "@/module-base/client/hooks/useLocalizedText";

import React, { useMemo } from "react";

type LocaleValue = {
  [key: string]: string | undefined;
  en?: string;
  vi?: string;
};

type ProductRow = {
  id: string;
  name?: LocaleValue | string;
  description?: LocaleValue | string;
  sku?: string;
  productMaster?: {
    id: string;
    name?: LocaleValue | string;
    brand?: LocaleValue | string;
    category?: {
      id: string;
      code?: string;
      name?: LocaleValue | string;
    };
  };
};

export default function ProductsListPage(): React.ReactNode {
  const localized = useLocalizedText();
  const columns = useMemo<DataTableColumn<ProductRow>[]>(() => {
    return [
      {
        key: "name",
        label: "Name",
        render: (_, row) => localized(row.name) || "-",
      },
      {
        key: "sku",
        label: "SKU",
        render: (value) => value ?? "-",
      },

      {
        key: "productMaster.name",
        label: "Master Name",
        render: (_, row) => localized(row.productMaster?.name) || "-",
      },
      {
        key: "productMaster.brand",
        label: "Brand",
        render: (_, row) => localized(row.productMaster?.brand) || "-",
      },
      {
        key: "productMaster.category.name",
        label: "Category",
        render: (_, row) =>
          localized(row.productMaster?.category?.name) ||
          row.productMaster?.category?.code ||
          "-",
      },
    ];
  }, []);
  return (
    <div>
      <ViewListDataTable model="product" columns={columns} title="Sản phẩm" />
    </div>
  );
}
