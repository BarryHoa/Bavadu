"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import {
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  IBaseTableColumnDefinition,
} from "@base/client/components";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { formatDate } from "@base/client/utils/date/formatDate";
import { IBaseChip } from "@base/client";
import { useTranslations } from "next-intl";
import React from "react";

import { CustomerIndividual } from "../../interface/Customer";

type CustomerIndividualRow = CustomerIndividual & {
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function CustomerIndividualsListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");

  // React Compiler will automatically optimize this array creation
  const columns: IBaseTableColumnDefinition<CustomerIndividualRow>[] = [
      {
        key: "code",
        label: "Code",
        render: (value, row) => {
          if (!row?.id) return value;

          return (
            <LinkAs
              href={`/workspace/modules/b2c-sales/customers/individuals/view/${row.id}`}
            >
              {row.code}
            </LinkAs>
          );
        },
      },
      {
        key: "firstName",
        label: "First Name",
      },
      {
        key: "lastName",
        label: "Last Name",
        render: (_, row) => `${row.firstName} ${row.lastName}`,
      },
      {
        key: "phone",
        label: "Phone",
      },
      {
        key: "email",
        label: "Email",
      },
      {
        key: "isActive",
        label: "Status",
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
        render: (value) => formatDate(value),
      },
      {
        key: I_BASE_TABLE_COLUMN_KEY_ACTION,
        label: tDataTable("columns.action"),
        align: "end",
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/workspace/modules/b2c-sales/customers/individuals/view/${row.id}`;
          const editLink = `/workspace/modules/b2c-sales/customers/individuals/edit/${row.id}`;

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
    ];

  return (
    <div className="space-y-4">
      <ViewListDataTable<CustomerIndividualRow>
        actionsRight={[
          {
            key: "new",
            title: "New Individual",
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/b2c-sales/customers/individuals/create",
            },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="b2c-sales-customer-individual"
      />
    </div>
  );
}
