import type { Column } from "drizzle-orm";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { ParamFilter } from "@base/shared/interface/FilterInterface";

import { ilike } from "drizzle-orm";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";

import { sale_b2c_tb_customer_companies } from "../../schemas";

class CustomerCompanyViewListModel extends BaseViewListModel<
  typeof sale_b2c_tb_customer_companies,
  any
> {
  constructor() {
    super({
      table: sale_b2c_tb_customer_companies,
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
      ["id", { column: sale_b2c_tb_customer_companies.id, sort: true }],
      ["code", { column: sale_b2c_tb_customer_companies.code, sort: true }],
      ["name", { column: sale_b2c_tb_customer_companies.name, sort: true }],
      ["taxId", { column: sale_b2c_tb_customer_companies.taxId, sort: true }],
      ["phone", { column: sale_b2c_tb_customer_companies.phone, sort: true }],
      ["email", { column: sale_b2c_tb_customer_companies.email, sort: true }],
      [
        "isActive",
        { column: sale_b2c_tb_customer_companies.isActive, sort: true },
      ],
      [
        "createdAt",
        { column: sale_b2c_tb_customer_companies.createdAt, sort: true },
      ],
      [
        "updatedAt",
        { column: sale_b2c_tb_customer_companies.updatedAt, sort: true },
      ],
    ]);

  protected declarationSearch = () =>
    new Map([
      [
        "code",
        (text: string) => ilike(sale_b2c_tb_customer_companies.code, text),
      ],
      [
        "name",
        (text: string) => ilike(sale_b2c_tb_customer_companies.name, text),
      ],
      [
        "taxId",
        (text: string) => ilike(sale_b2c_tb_customer_companies.taxId, text),
      ],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

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

  @BaseViewListModel.Auth({ required: true, permissions: ["b2csales.customer.view"] })
  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<any>> => {
    return this.buildQueryDataList(params);
  };
}

export default CustomerCompanyViewListModel;
