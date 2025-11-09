"use client";

import ActionMenu from "@/module-base/client/components/ActionMenu/ActionMenu";
import { DataTableColumn } from "@/module-base/client/components/DataTable";
import ViewListDataTable from "@/module-base/client/components/ViewListDataTable";
import { useLocalizedText } from "@/module-base/client/hooks/useLocalizedText";
import { formatDate } from "@/module-base/client/ultils/date/formatDate";

import { Chip } from "@heroui/react";
import React, { useMemo } from "react";

import { ProductCategoryRow } from "../../interface/ProductCategory";

const ProductCategoryListPage = (): React.ReactNode => {
  const localized = useLocalizedText();

  const columns = useMemo<DataTableColumn<ProductCategoryRow>[]>(() => {
    return [
      {
        key: "name",
        label: "Category Name",
        sortable: true,
        render: (_, row) => localized(row.name) || row.code,
      },
      {
        key: "code",
        label: "Code",
        sortable: true,
        render: (value) => value,
      },
      {
        key: "parent.name",
        label: "Parent",
        render: (_, row) =>
          row.parent ? localized(row.parent.name) || row.parent.id : "-",
      },
      {
        key: "level",
        label: "Level",
        align: "center",
        sortable: true,
        render: (value) => value ?? "-",
      },
      {
        key: "isActive",
        label: "Status",
        align: "center",
        sortable: true,
        render: (_, row) => (
          <Chip
            color={row.isActive ? "success" : "danger"}
            variant="flat"
            size="sm"
          >
            {row.isActive ? "Active" : "Inactive"}
          </Chip>
        ),
      },
      {
        key: "createdAt",
        label: "Created",
        sortable: true,
        render: (_, row) => (row.createdAt ? formatDate(row.createdAt) : "-"),
      },
      {
        key: "updatedAt",
        label: "Updated",
        sortable: true,
        render: (_, row) => (row.updatedAt ? formatDate(row.updatedAt) : "-"),
      },
      {
        key: "--actions--",
        label: "Actions",
        align: "end",
        render: (_, row) => (
          <ActionMenu
            actions={[
              {
                key: "view",
                label: "View",
                placement: "inline",
                onPress: () => {},
                variant: "bordered",
              },
              {
                key: "deactivate",
                label: row.isActive ? "Deactivate" : "Activate",
                placement: "menu",
                onPress: () => {},
              },
            ]}
          />
        ),
      },
    ];
  }, [localized]);

  return (
    <div>
      <ViewListDataTable
        model="product.category"
        columns={columns}
        title="Product Categories"
      />
    </div>
  );
};

export default ProductCategoryListPage;
