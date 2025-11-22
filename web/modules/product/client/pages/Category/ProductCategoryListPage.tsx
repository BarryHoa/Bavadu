"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
} from "@base/client/components/DataTable";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import type { LocalizeText } from "@base/client/interface/LocalizeText";
import { formatDate } from "@base/client/utils/date/formatDate";

import { Chip } from "@heroui/react";
import React, { useMemo } from "react";

import LinkAs from "@base/client/components/LinkAs";
import { getClientLink } from "@base/client/utils/link/getClientLink";
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
            path: "categories/view/[id]",
            as: `categories/view/${row.id}`,
          });
          return (
            <LinkAs href={path} as={as}>
              {localized(row.name as LocalizeText) || row.code}
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
          row.parent
            ? localized(row.parent.name as LocalizeText) || row.parent.id
            : "-",
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
        render: (_, row) => {
          const viewLink = getClientLink({
            mdl: "product",
            path: "categories/view/[id]",
            as: `categories/view/${row.id}`,
          });
          const editLink = getClientLink({
            mdl: "product",
            path: "categories/edit/[id]",
            as: `categories/edit/${row.id}`,
          });
          return (
            <ActionMenu
              actions={[
                {
                  key: "view",
                  label: "View",
                  href: viewLink.path,
                  as: viewLink.as,
                },
                {
                  key: "edit",
                  label: "Edit",
                  href: editLink.path,
                  as: editLink.as,
                },
              ]}
            />
          );
        },
      },
    ];
  }, [localized]);

  const createLink = getClientLink({
    mdl: "product",
    path: "categories/create",
  });

  return (
    <div className="space-y-4">
      <ViewListDataTable
        model="list.product.category"
        columns={columns}
        actionsRight={[
          {
            key: "new",
            title: "New Category",
            type: "link",
            color: "primary",
            props: {
              href: createLink.path,
              hrefAs: createLink.as as any,
            },
          },
        ]}
      />
    </div>
  );
};

export default ProductCategoryListPage;
