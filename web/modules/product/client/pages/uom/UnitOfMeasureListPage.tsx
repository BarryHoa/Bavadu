"use client";

import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  type DataTableColumn,
} from "@base/client/components/DataTable";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { Button, Chip } from "@heroui/react";
import { Plus } from "lucide-react";
import { useMemo } from "react";

import { getClientLink } from "@base/client/ultils/link/getClientLink";
import type { LocaleDataType } from "@base/server/interfaces/Locale";

interface UnitOfMeasureRow {
  id: string;
  name?: string | LocaleDataType<string> | null;
  symbol?: string | null;
  isActive?: boolean | null;
}

const UnitOfMeasureListPage = (): React.ReactNode => {
  const localized = useLocalizedText();

  const columns = useMemo<DataTableColumn<UnitOfMeasureRow>[]>(() => {
    return [
      {
        key: "name",
        label: "Unit name",
        render: (_, row) => localized(row.name ?? row.id) || row.id,
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
            size="sm"
            variant="flat"
            color={row.isActive ? "success" : "default"}
            className="capitalize"
          >
            {row.isActive ? "active" : "inactive"}
          </Chip>
        ),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: "Actions",
        align: "end",
        render: (_, row) => {
          const { as } = getClientLink({
            mdl: "product",
            path: "uom/view/[id]",
            as: `uom/view/${row.id}`,
          });

          return (
            <Button as={LinkAs as any} size="sm" variant="light" href={as}>
              View
            </Button>
          );
        },
      },
    ];
  }, [localized]);

  const { as: createHref } = getClientLink({
    mdl: "product",
    path: "uom/create",
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          color="primary"
          startContent={<Plus size={16} />}
          as={LinkAs as any}
          href={createHref}
        >
          Add UOM
        </Button>
      </div>

      <ViewListDataTable<UnitOfMeasureRow>
        model="product.uom"
        columns={columns}
        isDummyData={false}
      />
    </div>
  );
};

export default UnitOfMeasureListPage;
