import type { Column } from "drizzle-orm";
import { and, eq, ilike, sql } from "drizzle-orm";

import { ParamFilter } from "@base/server";
import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";

import { table_product_master } from "../../../../product/server/schemas/product-master";
import { table_stock_level, table_stock_warehouse } from "../../schemas";

export interface StockSummaryViewRow {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  reservedQuantity: number;
  minStock: number | null;
}

interface StockSummaryFilter extends ParamFilter {
  productId?: string;
  warehouseId?: string;
}

class ListStockSummaryModel extends BaseViewListModel<
  typeof table_stock_level,
  StockSummaryViewRow,
  StockSummaryFilter
> {
  protected declarationColumns() {
    return new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      [
        "productId",
        {
          column: table_stock_level.productId,
          sort: true,
        },
      ],
      [
        "productCode",
        {
          column: table_product_master.code,
          sort: true,
        },
      ],
      [
        "productName",
        {
          column: table_product_master.name,
          sort: true,
        },
      ],
      [
        "warehouseId",
        {
          column: table_stock_level.warehouseId,
          sort: true,
        },
      ],
      [
        "warehouseCode",
        {
          column: table_stock_warehouse.code,
          sort: true,
        },
      ],
      [
        "warehouseName",
        {
          column: table_stock_warehouse.name,
          sort: true,
        },
      ],
      [
        "quantity",
        {
          column: table_stock_level.quantity,
          sort: true,
        },
      ],
      [
        "reservedQuantity",
        {
          column: table_stock_level.reservedQuantity,
          sort: true,
        },
      ],
      [
        "minStock",
        {
          column: table_stock_warehouse.minStock,
          sort: true,
        },
      ],
    ]);
  }

  constructor() {
    super({
      table: table_stock_level,
      sortDefault: [
        {
          column: "productId",
          direction: "ascending",
        },
      ],
    });
  }

  protected declarationSearch() {
    return [
      (text: string) => ilike(table_stock_level.productId, text),
      (text: string) => ilike(table_product_master.code, text),
      (text: string) => ilike(sql`${table_product_master.name}::text`, text),
      (text: string) => ilike(table_stock_level.warehouseId, text),
      (text: string) => ilike(table_stock_warehouse.code, text),
      (text: string) => ilike(table_stock_warehouse.name, text),
    ];
  }

  protected declarationFilter() {
    return [
      (filters: StockSummaryFilter | undefined) => {
        const conditions: any[] = [];
        if (filters?.productId) {
          conditions.push(eq(table_stock_level.productId, filters.productId));
        }
        if (filters?.warehouseId) {
          conditions.push(
            eq(table_stock_level.warehouseId, filters.warehouseId)
          );
        }
        if (conditions.length === 0) {
          return undefined;
        }
        return and(...conditions);
      },
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(row: any): StockSummaryViewRow {
    return {
      id: `${row.productId}-${row.warehouseId}`,
      productId: row.productId,
      productCode: row.productCode || row.productId,
      productName:
        typeof row.productName === "string"
          ? row.productName
          : row.productName?.en || row.productName?.vi || row.productId,
      warehouseId: row.warehouseId,
      warehouseCode: row.warehouseCode || row.warehouseId,
      warehouseName: row.warehouseName || row.warehouseId,
      quantity: Number(row.quantity),
      reservedQuantity: Number(row.reservedQuantity),
      minStock: row.minStock ? Number(row.minStock) : null,
    };
  }

  getData = async (
    params: ListParamsRequest<StockSummaryFilter> = {}
  ): Promise<ListParamsResponse<StockSummaryViewRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query
        .leftJoin(
          table_product_master,
          eq(table_stock_level.productId, table_product_master.id)
        )
        .leftJoin(
          table_stock_warehouse,
          eq(table_stock_level.warehouseId, table_stock_warehouse.id)
        )
    );
  };
}

export default ListStockSummaryModel;
