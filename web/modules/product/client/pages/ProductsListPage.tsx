"use client";
import ActionMenu from "@/module-base/client/components/ActionMenu/ActionMenu";
import { DataTableColumn } from "@/module-base/client/components/DataTable";
import ViewListDataTable from "@/module-base/client/components/ViewListDataTable";
import { useLocalizedText } from "@/module-base/client/hooks/useLocalizedText";
import { formatDate } from "@/module-base/client/ultils/date/formatDate";
import { getClientLink } from "@/module-base/client/ultils/link/getClientLink";
import Link from "next/link";

import { Chip } from "@heroui/react";
import React, { useMemo } from "react";
import { ProductRow } from "../interface/Product";

type LocaleValue = {
  [key: string]: string | undefined;
  en?: string;
  vi?: string;
};

export default function ProductsListPage(): React.ReactNode {
  const localized = useLocalizedText();
  const columns = useMemo<DataTableColumn<ProductRow>[]>(() => {
    return [
      {
        key: "name",
        label: "Name",
        render: (_, row) => {
          const { path, as } = getClientLink({
            mdl: "product",
            path: "[id]",
            as: row.id,
          });
          return (
            <Link href={path} as={as} className="text-sky-600 hover:underline">
              {localized(row.name) || row.id}
            </Link>
          );
        },
      },
      {
        key: "sku",
        label: "SKU",
        render: (value) => value ?? "-",
      },
      {
        key: "barcode",
        label: "Barcode",
        render: (value) => value ?? "-",
      },
      {
        key: "productMaster.brand",
        label: "Brand",
        render: (_, row) => localized(row.productMaster?.brand),
      },
      {
        key: "productMaster.category.name",
        label: "Category",
        render: (_, row) =>
          localized(row.productMaster?.category?.name) ||
          row.productMaster?.category?.code ||
          "-",
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
        key: "baseUom.name",
        label: "Base UOM",
        render: (_, row) => localized(row.baseUom?.name),
      },
      {
        key: "manufacturer.name",
        label: "Manufacturer",
        render: (_, row) => localized(row.manufacturer?.name),
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
        key: "--action--",
        label: "Action",
        align: "end",
        render: (_, row) => {
          const viewLink = getClientLink({
            mdl: "product",
            path: "[id]",
            as: row.id,
          });
          const editLink = getClientLink({
            mdl: "product",
            path: "[id]",
            as: row.id,
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
  return (
    <div>
      <ViewListDataTable model="product" columns={columns} title="Sản phẩm" />
    </div>
  );
}
