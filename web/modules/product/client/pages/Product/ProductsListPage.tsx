"use client";
import type { LocalizeText } from "@base/client/interface/LocalizeText";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
} from "@base/client/components";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { formatDate } from "@base/client/utils/date/formatDate";
import { getClientLink } from "@base/client/utils/link/getClientLink";
import LinkAs from "@base/client/components/LinkAs";
import { Chip } from "@base/client";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";

import { ProductRow } from "../../interface/Product";
import { convertProductMasterFeaturesToArrayKey } from "../../utils/getNameProductFeatures";
import { getNameProductType } from "../../utils/getNameProductType";

export default function ProductsListPage(): React.ReactNode {
  const localized = useLocalizedText();
  const t = useTranslations("dataTable");
  const tProduct = useTranslations("mdl-product");
  const columns = useMemo<DataTableColumn<ProductRow>[]>(() => {
    return [
      {
        key: "name",
        label: "Name",
        sortable: true,
        minWidth: 150,
        maxWidth: 300,
        render: (_, row) => {
          const { path, as } = getClientLink({
            mdl: "product",
            path: "view/[id]",
            as: `view/${row.id}`,
          });

          return (
            <LinkAs as={as} href={path}>
              {localized(row.name as LocalizeText) || row.id}
            </LinkAs>
          );
        },
      },
      {
        key: "sku",
        label: "SKU",
        minWidth: 100,
        maxWidth: 150,
        render: (value) => value,
      },
      {
        key: "barcode",
        label: "Barcode",
        minWidth: 120,
        maxWidth: 200,
        render: (value) => value,
      },
      {
        key: "baseUom.name",
        label: "Base UOM",
        minWidth: 100,
        maxWidth: 150,
        render: (_, row) => localized(row.baseUom?.name as LocalizeText),
      },
      {
        key: "productMaster.type",
        label: "Type",
        minWidth: 100,
        maxWidth: 150,
        render: (_, row) => getNameProductType(row.productMaster?.type),
      },
      {
        key: "productMaster.features",
        label: "Features",
        minWidth: 150,
        maxWidth: 250,
        render: (_, row) => {
          const features = convertProductMasterFeaturesToArrayKey(
            row.productMaster?.features,
          );

          return features.map((feature) =>
            tProduct(`productFeature.${feature}`),
          );
        },
      },
      {
        key: "status",
        label: "Status",
        align: "center",
        minWidth: 100,
        maxWidth: 120,
        render: (_, row) => {
          return (
            <Chip
              color={row.isActive ? "success" : "danger"}
              size="sm"
              variant="flat"
            >
              {row.isActive ? "Active" : "Inactive"}
            </Chip>
          );
        },
      },
      {
        key: "productMaster.category.name",
        label: "Category",
        minWidth: 120,
        maxWidth: 200,
        render: (_, row) =>
          localized(row.productMaster?.category?.name as LocalizeText) ||
          row.productMaster?.category?.code,
      },
      {
        key: "manufacturer.name",
        label: "Manufacturer",
        minWidth: 120,
        maxWidth: 200,
        render: (_, row) =>
          typeof row.manufacturer?.name === "string"
            ? row.manufacturer.name
            : (row.manufacturer?.code ?? "-"),
      },
      {
        key: "productMaster.brand",
        label: "Brand",
        minWidth: 100,
        maxWidth: 180,
        render: (_, row) =>
          typeof row.productMaster?.brand === "string"
            ? row.productMaster.brand
            : "-",
      },

      {
        key: "createdAt",
        label: "Created At",
        minWidth: 120,
        maxWidth: 150,
        render: (_, row) => formatDate(row.createdAt),
      },
      {
        key: "updatedAt",
        label: "Updated At",
        minWidth: 120,
        maxWidth: 150,
        render: (_, row) => formatDate(row.updatedAt),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: t("columns.action"),
        align: "end",
        minWidth: 80,
        maxWidth: 100,
        render: (_, row) => {
          const viewLink = getClientLink({
            mdl: "product",
            path: "view/[id]",
            as: `view/${row.id}`,
          });
          const editLink = getClientLink({
            mdl: "product",
            path: "edit/[id]",
            as: `edit/${row.id}`,
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
  }, [t]);

  const createLink = getClientLink({
    mdl: "product",
    path: "create",
  });

  return (
    <div className="space-y-4">
      <ViewListDataTable
        actionsRight={[
          {
            key: "new",
            title: "New Product",
            type: "link",
            color: "primary",
            props: {
              href: createLink.path,
              as: createLink.as as any,
            },
          },
        ]}
        columns={columns}
        model="product"
      />
    </div>
  );
}
