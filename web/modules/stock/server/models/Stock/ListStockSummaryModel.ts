import { and, asc, eq, ilike, or, sql } from "drizzle-orm";

import { getEnv } from "@base/server";
import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";

import { table_product_master } from "../../../../product/server/schemas/product-master";
import type { TblStockLevel } from "../../schemas";
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

interface StockSummaryFilter {
  productId?: string;
  warehouseId?: string;
}

class ListStockSummaryModel extends BaseViewListModel<
  typeof table_stock_level,
  StockSummaryViewRow,
  StockSummaryFilter
> {
  constructor() {
    super(table_stock_level);
  }

  getViewDataList = async (
    params: ListParamsRequest<StockSummaryFilter> = {}
  ): Promise<ListParamsResponse<StockSummaryViewRow>> => {
    const { offset, limit, search, filters } =
      this.getDefaultParamsForList(params);
    const db = getEnv().getDb();

    const whereClauses = [];

    // Apply filters
    if (filters?.productId) {
      whereClauses.push(eq(table_stock_level.productId, filters.productId));
    }

    if (filters?.warehouseId) {
      whereClauses.push(
        eq(table_stock_level.warehouseId, filters.warehouseId)
      );
    }

    // Apply search
    if (search) {
      const term = `%${String(search).trim()}%`;
      whereClauses.push(
        or(
          ilike(table_stock_level.productId, term),
          ilike(table_product_master.code, term),
          ilike(sql`${table_product_master.name}::text`, term),
          ilike(table_stock_level.warehouseId, term),
          ilike(table_stock_warehouse.code, term),
          ilike(table_stock_warehouse.name, term)
        )
      );
    }

    const baseQuery = db
      .select({
        id: sql<string>`concat(${table_stock_level.productId}, '-', ${table_stock_level.warehouseId})`.as(
          "id"
        ),
        productId: table_stock_level.productId,
        productCode: table_product_master.code,
        productName: table_product_master.name,
        warehouseId: table_stock_level.warehouseId,
        warehouseCode: table_stock_warehouse.code,
        warehouseName: table_stock_warehouse.name,
        quantity: table_stock_level.quantity,
        reservedQuantity: table_stock_level.reservedQuantity,
        minStock: table_stock_warehouse.minStock,
        total: sql<number>`count(*) over()::int`.as("total"),
      })
      .from(table_stock_level)
      .leftJoin(
        table_product_master,
        eq(table_stock_level.productId, table_product_master.id)
      )
      .leftJoin(
        table_stock_warehouse,
        eq(table_stock_level.warehouseId, table_stock_warehouse.id)
      );

    let query: any = baseQuery;

    if (whereClauses.length > 0) {
      query = query.where(and(...whereClauses));
    }

    const records = (await query
      .orderBy(asc(table_stock_level.productId))
      .limit(limit)
      .offset(offset)) as Array<{
      id: string;
      productId: string;
      productCode: string | null;
      productName: Record<string, string> | null;
      warehouseId: string;
      warehouseCode: string | null;
      warehouseName: string | null;
      quantity: string;
      reservedQuantity: string;
      minStock: string | null;
      total: number;
    }>;

    const total = records.length > 0 ? records[0].total : 0;

    const data: StockSummaryViewRow[] = records.map((record) => ({
      id: record.id,
      productId: record.productId,
      productCode: record.productCode || record.productId,
      productName:
        typeof record.productName === "string"
          ? record.productName
          : record.productName?.en || record.productName?.vi || record.productId,
      warehouseId: record.warehouseId,
      warehouseCode: record.warehouseCode || record.warehouseId,
      warehouseName: record.warehouseName || record.warehouseId,
      quantity: Number(record.quantity),
      reservedQuantity: Number(record.reservedQuantity),
      minStock: record.minStock ? Number(record.minStock) : null,
    }));

    return this.getPagination({ data, total });
  };
}

export default ListStockSummaryModel;

