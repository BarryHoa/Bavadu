"use client";

import type { LocalizeText } from "@base/client/interface/LocalizeText";

import { useTranslations } from "next-intl";
import React from "react";

import { IBaseChip } from "@base/client";
import {
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  IBaseTableColumnDefinition,
} from "@base/client/components";
import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import IBaseLink from "@base/client/components/IBaseLink";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { formatDate } from "@base/client/utils/date/formatDate";
import { getClientLink } from "@base/client/utils/link/getClientLink";

import { ProductCategoryRow } from "../../interface/ProductCategory";

const ProductCategoryListPage = (): React.ReactNode => {
  const localized = useLocalizedText();
  const t = useTranslations("dataTable");

  // React Compiler will automatically optimize this array creation
  const columns: IBaseTableColumnDefinition<ProductCategoryRow>[] = [
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
          <IBaseLink as={as} href={path}>
            {localized(row.name as LocalizeText) || row.code}
          </IBaseLink>
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
        <IBaseChip
          color={row.isActive ? "success" : "danger"}
          size="sm"
          variant="flat"
        >
          {row.isActive ? "Active" : "Inactive"}
        </IBaseChip>
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
      key: I_BASE_TABLE_COLUMN_KEY_ACTION,
      label: t("columns.action"),
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

  const createLink = getClientLink({
    mdl: "product",
    path: "categories/create",
  });

  return (
    <div className="space-y-4">
      <ViewListDataTable
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
        columns={columns}
        model="product-category"
      />
    </div>
  );
};

export default ProductCategoryListPage;
