"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
} from "@base/client/components/DataTable";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { formatDate } from "@base/client/ultils/date/formatDate";

import { Button, Chip } from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

import LinkAs from "@base/client/components/LinkAs";
import { getClientLink } from "@base/client/ultils/link/getClientLink";
import { ProductCategoryRow } from "../../interface/ProductCategory";

const ProductCategoryListPage = (): React.ReactNode => {
  const localized = useLocalizedText();
  const router = useRouter();

  const columns = useMemo<DataTableColumn<ProductCategoryRow>[]>(() => {
    return [
      {
        key: "name",
        label: "Category Name",
        sortable: true,
        render: (_, row) => {
          const { path, as } = getClientLink({
            mdl: "product",
            path: "categories/view/[id]",
            as: `categories/view/${row.id}`,
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
                onPress: () => {
                  const { path, as } = getClientLink({
                    mdl: "product",
                    path: "categories/view/[id]",
                    as: `categories/view/${row.id}`,
                  });
                  router.push(as ?? path);
                },
                variant: "bordered",
              },
              {
                key: "edit",
                label: "Edit",
                placement: "menu",
                onPress: () => {
                  const { path, as } = getClientLink({
                    mdl: "product",
                    path: "categories/edit/[id]",
                    as: `categories/edit/${row.id}`,
                  });
                  router.push(as ?? path);
                },
              },
            ]}
          />
        ),
      },
    ];
  }, [localized, router]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          color="primary"
          onPress={() => {
            const { path, as } = getClientLink({
              mdl: "product",
              path: "categories/create",
            });
            router.push(as ?? path);
          }}
          variant="solid"
        >
          New Category
        </Button>
      </div>

      <ViewListDataTable model="product.category" columns={columns} />
    </div>
  );
};

export default ProductCategoryListPage;
