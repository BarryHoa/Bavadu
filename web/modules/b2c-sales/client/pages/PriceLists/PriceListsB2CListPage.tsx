"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
} from "@base/client/components/DataTable";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { formatDate } from "@base/client/utils/date/formatDate";
import { Chip } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { PriceListB2CDto } from "../../services/PriceListB2CService";

type PriceListB2CRow = PriceListB2CDto & {
  validFrom?: number | string | null;
  validTo?: number | string | null;
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function PriceListsB2CListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");

  const columns = useMemo<DataTableColumn<PriceListB2CRow>[]>(
    () => [
      {
        key: "code",
        label: "Code",
        render: (value, row) => {
          if (!row?.id) return value;
          return (
            <LinkAs
              href={`/workspace/modules/b2c-sales/price-lists/view/${row.id}`}
            >
              {row.code}
            </LinkAs>
          );
        },
      },
      {
        key: "name",
        label: "Name",
        render: (value) => {
          if (typeof value === "object" && value !== null) {
            return value.vi || value.en || "";
          }
          return value || "";
        },
      },
      {
        key: "type",
        label: "Type",
        render: (value) => (
          <Chip size="sm" variant="flat" className="capitalize">
            {value || "standard"}
          </Chip>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (value) => (
          <Chip size="sm" variant="flat" className="capitalize">
            {value || "draft"}
          </Chip>
        ),
      },
      {
        key: "isDefault",
        label: "Default",
        render: (value) => (value ? "Yes" : "No"),
      },
      {
        key: "validFrom",
        label: "Valid From",
        render: (value) => formatDate(value),
      },
      {
        key: "validTo",
        label: "Valid To",
        render: (value) => (value ? formatDate(value) : "Forever"),
      },
      {
        key: "priority",
        label: "Priority",
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: tDataTable("columns.action"),
        align: "end",
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/workspace/modules/b2c-sales/price-lists/view/${row.id}`;
          const editLink = `/workspace/modules/b2c-sales/price-lists/edit/${row.id}`;
          return (
            <ActionMenu
              actions={[
                {
                  key: "view",
                  label: "View",
                  href: viewLink,
                },
                {
                  key: "edit",
                  label: "Edit",
                  href: editLink,
                },
              ]}
            />
          );
        },
      },
    ],
    [tDataTable]
  );

  return (
    <div className="space-y-4">
      <ViewListDataTable<PriceListB2CRow>
        model="b2c-sales.price-list.view-list"
        columns={columns}
        isDummyData={false}
        actionsRight={[
          {
            key: "new",
            title: "New Price List",
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/b2c-sales/price-lists/create",
            },
          },
        ]}
      />
    </div>
  );
}
