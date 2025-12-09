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
import { table_customer_individual } from "../../schemas";

class CustomerIndividualViewListModel extends BaseViewListModel<
  typeof table_customer_individual,
  any
> {
  constructor() {
    super({
      table: table_customer_individual,
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
      ["id", { column: table_customer_individual.id, sort: true }],
      ["code", { column: table_customer_individual.code, sort: true }],
      ["firstName", { column: table_customer_individual.firstName, sort: true }],
      ["lastName", { column: table_customer_individual.lastName, sort: true }],
      ["phone", { column: table_customer_individual.phone, sort: true }],
      ["email", { column: table_customer_individual.email, sort: true }],
      ["isActive", { column: table_customer_individual.isActive, sort: true }],
      ["createdAt", { column: table_customer_individual.createdAt, sort: true }],
      ["updatedAt", { column: table_customer_individual.updatedAt, sort: true }],
    ]);

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(table_customer_individual.code, text)],
      ["firstName", (text: string) => ilike(table_customer_individual.firstName, text)],
      ["lastName", (text: string) => ilike(table_customer_individual.lastName, text)],
      ["phone", (text: string) => ilike(table_customer_individual.phone, text)],
      ["email", (text: string) => ilike(table_customer_individual.email, text)],
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

