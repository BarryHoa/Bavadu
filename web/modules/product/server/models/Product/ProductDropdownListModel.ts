import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import { table_product_variant } from "../../schemas";
import { ProductFilter } from "./ProductModelInterface";

type ProductDropdownOption = {
  label: string;
  value: string;
  [key: string]: any;
};

class ProductDropdownListModel extends BaseViewListModel<
  typeof table_product_variant,
  ProductDropdownOption,
  ProductFilter
> {
  constructor() {
    super({
      table: table_product_variant,
      sortDefault: [
        {
          column: "createdAt",
          direction: "descending",
        },
      ],
    });
  }

  protected declarationColumns() {
    // Minimal columns for dropdown - only id and name
    return new Map();
  }

  protected declarationSearch() {
    return new Map();
  }

  protected declarationFilter() {
    return new Map();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(
    row: any,
    index: number
  ): ProductDropdownOption {
    return {
      label: row.name,
      value: row.id,
    };
  }

  getData = async (
    params: ListParamsRequest<ProductFilter>
  ): Promise<ListParamsResponse<ProductDropdownOption>> => {
    const result = await this.buildQueryDataListWithSelect(
      params,
      {
        id: this.table.id,
        name: this.table.name,
      },
      (query) => {
        return query;
      }
    );
    return {
      data: (result?.data ?? []).map((row: any, index: number) =>
        this.declarationMappingData(row, index)
      ),
      total: result?.total ?? 0,
    };
  };
}

export default ProductDropdownListModel;

