"use client";

import type { LocalizeText } from "@base/client/interface/LocalizeText";
import type { LocaleDataType } from "@base/shared/interface/Locale";

import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  type DataTableColumn,
} from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { Button, Chip } from "@base/client";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
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

  const columns = useMemo<DataTableColumn<UnitOfMeasureRow>[]>(() => {
    return [
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
          <Chip
            className="capitalize"
            color={row.isActive ? "success" : "default"}
            size="sm"
            variant="flat"
          >
            {row.isActive ? "active" : "inactive"}
          </Chip>
        ),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: t("columns.action"),
        align: "end",
        render: (_, row) => {
          const { as } = getClientLink({
            mdl: "product",
            path: "uom/view/[id]",
            as: `uom/view/${row.id}`,
          });

          return (
            <Button as={LinkAs as any} href={as} size="sm" variant="light">
              View
            </Button>
          );
        },
      },
    ];
  }, [localized, t]);

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
