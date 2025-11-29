"use client";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
} from "@base/client/components/DataTable";
import { formatDate } from "@base/client/utils/date/formatDate";
import { Chip } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { CustomerCompany } from "../../../interface/Customer";

type CustomerCompanyRow = CustomerCompany & {
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function CustomerCompaniesListPage(): React.ReactNode {
  const tDataTable = useTranslations("dataTable");

  const columns = useMemo<DataTableColumn<CustomerCompanyRow>[]>(
    () => [
      {
        key: "code",
        label: "Code",
        render: (value, row) => {
          if (!row?.id) return value;
          return (
            <LinkAs href={`/workspace/modules/b2b-sales/customers/companies/view/${row.id}`}>
              {row.code}
            </LinkAs>
          );
        },
      },
      {
        key: "name",
        label: "Company Name",
      },
      {
        key: "taxId",
        label: "Tax ID",
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
        render: (value) => formatDate(value),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: tDataTable("columns.action"),
        align: "end",
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/workspace/modules/b2b-sales/customers/companies/view/${row.id}`;
          const editLink = `/workspace/modules/b2b-sales/customers/companies/edit/${row.id}`;
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
      <ViewListDataTable<CustomerCompanyRow>
        model="list.b2b-sales.customer.company"
        columns={columns}
        isDummyData={false}
        actionsRight={[
          {
            key: "new",
            title: "New Company",
            type: "link",
            color: "primary",
            props: {
              href: "/workspace/modules/b2b-sales/customers/companies/create",
            },
          },
        ]}
      />
    </div>
  );
}

