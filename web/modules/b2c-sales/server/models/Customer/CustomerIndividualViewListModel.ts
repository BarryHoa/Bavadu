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
import { sale_b2c_tb_customers } from "../../schemas";

class CustomerIndividualViewListModel extends BaseViewListModel<
  typeof sale_b2c_tb_customers,
  any
> {
  constructor() {
    super({
      table: sale_b2c_tb_customers,
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
      ["id", { column: sale_b2c_tb_customers.id, sort: true }],
      ["code", { column: sale_b2c_tb_customers.code, sort: true }],
      ["firstName", { column: sale_b2c_tb_customers.firstName, sort: true }],
      ["lastName", { column: sale_b2c_tb_customers.lastName, sort: true }],
      ["phone", { column: sale_b2c_tb_customers.phone, sort: true }],
      ["email", { column: sale_b2c_tb_customers.email, sort: true }],
      ["isActive", { column: sale_b2c_tb_customers.isActive, sort: true }],
      ["createdAt", { column: sale_b2c_tb_customers.createdAt, sort: true }],
      ["updatedAt", { column: sale_b2c_tb_customers.updatedAt, sort: true }],
    ]);

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(sale_b2c_tb_customers.code, text)],
      ["firstName", (text: string) => ilike(sale_b2c_tb_customers.firstName, text)],
      ["lastName", (text: string) => ilike(sale_b2c_tb_customers.lastName, text)],
      ["phone", (text: string) => ilike(sale_b2c_tb_customers.phone, text)],
      ["email", (text: string) => ilike(sale_b2c_tb_customers.email, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData = (row: any): any => ({
    id: row.id,
    code: row.code,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    address: row.address ?? undefined,
    dateOfBirth: row.dateOfBirth?.getTime(),
    gender: row.gender ?? undefined,
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

export default CustomerIndividualViewListModel;

