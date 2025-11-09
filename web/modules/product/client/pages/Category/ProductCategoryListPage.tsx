"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
} from "@base/client/components/DataTable";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { formatDate } from "@base/client/ultils/date/formatDate";

import { Chip } from "@heroui/react";
import React, { useMemo } from "react";

import LinkAs from "@base/client/components/LinkAs";
import { getClientLink } from "@base/client/ultils/link/getClientLink";
import { ProductCategoryRow } from "../../interface/ProductCategory";

const ProductCategoryListPage = (): React.ReactNode => {
  const localized = useLocalizedText();

  const columns = useMemo<DataTableColumn<ProductCategoryRow>[]>(() => {
    return [
      {
        key: "name",
        label: "Category Name",
        sortable: true,
        render: (_, row) => {
          const { path, as } = getClientLink({
            mdl: "product",
            path: "category/[id]",
            as: `category/${row.id}`,
          });
          return (
            <LinkAs href={path} as={as}>
              {localized(row.name) || row.code}
            </LinkAs>
          );
        },
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
        key: DATA_TABLE_COLUMN_KEY_ACTION,
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
