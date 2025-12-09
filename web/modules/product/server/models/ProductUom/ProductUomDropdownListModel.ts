import {
  BaseViewListModel,
  type FilterCondition,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { Column } from "drizzle-orm";
import { asc, eq, ilike, sql } from "drizzle-orm";
import { table_unit_of_measure } from "../../schemas";

type UomFilter = {
  isActive?: boolean;
};

type ProductUomDropdownOption = {
  label: string;
  value: string;
  [key: string]: any;
};

class ProductUomDropdownListModel extends BaseViewListModel<
  typeof table_unit_of_measure,
  ProductUomDropdownOption,
  UomFilter
> {
  constructor() {
    super({
      table: table_unit_of_measure,
      sortDefault: [
        {
          column: "name",
          direction: "ascending",
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
      ["id", { column: table_unit_of_measure.id, sort: false }],
      ["name", { column: table_unit_of_measure.name, sort: false }],
      ["symbol", { column: table_unit_of_measure.symbol, sort: false }],
      ["isActive", { column: table_unit_of_measure.isActive, sort: false }],
    ]);

  protected declarationSearch = () =>
    new Map([
      // name is jsonb, need to cast to text before using ilike
      [
        "name",
        (text: string) =>
          ilike(sql`${table_unit_of_measure.name}::text`, `%${text}%`),
      ],
      [
        "symbol",
        (text: string) => ilike(table_unit_of_measure.symbol, `%${text}%`),
      ],
    ]);

  protected declarationFilter = (): FilterConditionMap<UomFilter> => {
    const filters: Array<[string, FilterCondition<UomFilter>]> = [
      [
        "isActive",
        (value?: unknown) =>
          typeof value === "boolean"
            ? eq(table_unit_of_measure.isActive, value)
            : undefined,
      ],
    ];

    return new Map(filters);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData = (row: any): ProductUomDropdownOption => {
    return {
      label: row.name,
      value: row.id,
      symbol: row.symbol,
    };
  };

  getData = async (
    params: ListParamsRequest<UomFilter>
  ): Promise<ListParamsResponse<ProductUomDropdownOption>> => {
    return this.buildQueryDataList(params, (query) => {
      return query.orderBy(asc(table_unit_of_measure.name));
    });
  };
}

export default ProductUomDropdownListModel;
