"use client";

import type { LocalizeText } from "@base/client/interface/LocalizeText";
import type { LocaleDataType } from "@base/shared/interface/Locale";

import { useTranslations } from "next-intl";
import React from "react";

import { IBaseButton, IBaseChip } from "@base/client";
import {
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  type IBaseTableColumnDefinition,
} from "@base/client/components";
import IBaseLink from "@base/client/components/IBaseLink";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { getClientLink } from "@base/client/utils/link/getClientLink";

interface UnitOfMeasureRow {
  id: string;
  name?: string | LocaleDataType<string> | null;
  symbol?: string | null;
  isActive?: boolean | null;
}

const UnitOfMeasureListPage = (): React.ReactNode => {
  const localized = useLocalizedText();
  const t = useTranslations("dataTable");

  // React Compiler will automatically optimize this array creation
  const columns: IBaseTableColumnDefinition<UnitOfMeasureRow>[] = [
    {
      key: "name",
      label: "Unit name",
      render: (_, row) =>
        localized((row.name ?? row.id) as LocalizeText) || row.id,
    },
    {
      key: "symbol",
      label: "Symbol",
      render: (value) => value ?? "—",
    },
    {
      key: "isActive",
      label: "Status",
      align: "center",
      render: (_, row) => (
        <IBaseChip
          className="capitalize"
          color={row.isActive ? "success" : "default"}
          size="sm"
          variant="flat"
        >
          {row.isActive ? "active" : "inactive"}
        </IBaseChip>
      ),
    },
    {
      key: I_BASE_TABLE_COLUMN_KEY_ACTION,
      label: t("columns.action"),
      align: "end",
      render: (_, row) => {
        const { as } = getClientLink({
          mdl: "product",
          path: "uom/view/[id]",
          as: `uom/view/${row.id}`,
        });

        return (
          <IBaseButton
            as={IBaseLink as any}
            href={as}
            size="sm"
            variant="light"
          >
            View
          </IBaseButton>
        );
      },
    },
  ];

  const createLink = getClientLink({
    mdl: "product",
    path: "uom/create",
  });

  return (
    <div className="space-y-4">
      <ViewListDataTable<UnitOfMeasureRow>
        actionsRight={[
          {
            key: "new",
            title: "Add UOM",
            type: "link",
            color: "primary",
            props: {
              href: createLink.path,
              hrefAs: createLink.as as any,
            },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="product.uom"
      />
    </div>
  );
};

export default UnitOfMeasureListPage;
