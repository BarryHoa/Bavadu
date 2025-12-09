import type { Column } from "drizzle-orm";
import { ilike } from "drizzle-orm";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { ParamFilter } from "@base/server/models/interfaces/FilterInterface";
import { table_customer_company } from "../../schemas";

class CustomerCompanyViewListModel extends BaseViewListModel<
  typeof table_customer_company,
  any
> {
  constructor() {
    super({
      table: table_customer_company,
      sortDefault: [
        {
          column: "createdAt",
          direction: "descending",
        },
      ],
    });
  }

  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: table_customer_company.id, sort: true }],
      ["code", { column: table_customer_company.code, sort: true }],
      ["name", { column: table_customer_company.name, sort: true }],
      ["taxId", { column: table_customer_company.taxId, sort: true }],
      ["phone", { column: table_customer_company.phone, sort: true }],
      ["email", { column: table_customer_company.email, sort: true }],
      ["isActive", { column: table_customer_company.isActive, sort: true }],
      ["createdAt", { column: table_customer_company.createdAt, sort: true }],
      ["updatedAt", { column: table_customer_company.updatedAt, sort: true }],
    ]);

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(table_customer_company.code, text)],
      ["name", (text: string) => ilike(table_customer_company.name, text)],
      ["taxId", (text: string) => ilike(table_customer_company.taxId, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData = (row: any): any => ({
    id: row.id,
    code: row.code,
    name: row.name,
    taxId: row.taxId ?? undefined,
    address: row.address ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    website: row.website ?? undefined,
    contactPerson: row.contactPerson ?? undefined,
    creditLimit: row.creditLimit ?? undefined,
    paymentTermsId: row.paymentTermsId ?? undefined,
    isActive: row.isActive,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<any>> => {
    return this.buildQueryDataList(params);
  };
}

export default CustomerCompanyViewListModel;

