"use client";
import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
} from "@base/client/components/DataTable";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { formatDate } from "@base/client/utils/date/formatDate";
import { getClientLink } from "@base/client/utils/link/getClientLink";

import LinkAs from "@base/client/components/LinkAs";
import { Chip } from "@heroui/react";
import React, { useMemo } from "react";
import { ProductMasterFeatures, ProductRow } from "../../interface/Product";
import {
  convertProductMasterFeaturesToArrayKey,
  getNameProductFeatures,
} from "../../utils/getNameProductFeatures";
import { getNameProductType } from "../../utils/getNameProductType";

export default function ProductsListPage(): React.ReactNode {
  const localized = useLocalizedText();
  const columns = useMemo<DataTableColumn<ProductRow>[]>(() => {
    return [
      {
        key: "name",
        label: "Name",
        sortable: true,
        render: (_, row) => {
          const { path, as } = getClientLink({
            mdl: "product",
            path: "view/[id]",
            as: `view/${row.id}`,
          });
          return (
            <LinkAs href={path} as={as}>
              {localized(row.name) || row.id}
            </LinkAs>
          );
        },
      },
      {
        key: "sku",
        label: "SKU",
        render: (value) => value,
      },
      {
        key: "barcode",
        label: "Barcode",
        render: (value) => value,
      },
      {
        key: "baseUom.name",
        label: "Base UOM",
        render: (_, row) => localized(row.baseUom?.name),
      },
      {
        key: "productMaster.type",
        label: "Type",
        render: (_, row) => getNameProductType(row.productMaster?.type),
      },
      {
        key: "productMaster.features",
        label: "Features",
        render: (_, row) => {
          const features = convertProductMasterFeaturesToArrayKey(
            row.productMaster?.features
          );
          return getNameProductFeatures(
            features as unknown as ProductMasterFeatures[]
          );
        },
      },
      {
        key: "status",
        label: "Status",
        align: "center",
        render: (_, row) => {
          return (
            <Chip
              color={row.isActive ? "success" : "danger"}
              variant="flat"
              size="sm"
            >
              {row.isActive ? "Active" : "Inactive"}
            </Chip>
          );
        },
      },
      {
        key: "productMaster.category.name",
        label: "Category",
        render: (_, row) =>
          localized(row.productMaster?.category?.name) ||
          row.productMaster?.category?.code,
      },
      {
        key: "manufacturer.name",
        label: "Manufacturer",
        render: (_, row) =>
          typeof row.manufacturer?.name === "string"
            ? row.manufacturer.name
            : row.manufacturer?.code ?? "-",
      },
      {
        key: "productMaster.brand",
        label: "Brand",
        render: (_, row) =>
          typeof row.productMaster?.brand === "string"
            ? row.productMaster.brand
            : "-",
      },

      {
        key: "createdAt",
        label: "Created At",
        render: (_, row) => formatDate(row.createdAt),
      },
      {
        key: "updatedAt",
        label: "Updated At",
        render: (_, row) => formatDate(row.updatedAt),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: "Action",
        align: "end",
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
  }, []);

  const createLink = getClientLink({
    mdl: "product",
    path: "create",
  });

  return (
    <div className="space-y-4">
      <ViewListDataTable
        model="list.product"
        columns={columns}
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
      />
    </div>
  );
}
