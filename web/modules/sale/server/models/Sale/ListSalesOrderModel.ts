import { desc, eq, sql } from "drizzle-orm";

import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import { getEnv } from "@base/server";
import {
  table_sales_order,
} from "../../schemas";

class ListSalesOrderModel extends BaseViewListModel<
  typeof table_sales_order
> {
  constructor() {
    super(table_sales_order);
  }

  getViewDataList = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<any>> => {
    const env = getEnv();
    const db = env.getDb();

    const { offset, limit, search } = this.getDefaultParamsForList(params);

    const baseQuery = db
      .select({
        id: table_sales_order.id,
        code: table_sales_order.code,
        customerName: table_sales_order.customerName,
        status: table_sales_order.status,
        warehouseId: table_sales_order.warehouseId,
        expectedDate: table_sales_order.expectedDate,
        totalAmount: table_sales_order.totalAmount,
        currency: table_sales_order.currency,
        notes: table_sales_order.notes,
        createdAt: table_sales_order.createdAt,
        updatedAt: table_sales_order.updatedAt,
        total: sql<number>`count(*) over()::int`.as("total"),
      })
      .from(table_sales_order);

    let composedQuery = baseQuery;
    if (search) {
      composedQuery = composedQuery.where(
        sql`(${table_sales_order.code} ILIKE ${`%${search}%`} OR ${table_sales_order.customerName} ILIKE ${`%${search}%`})`
      ) as typeof composedQuery;
    }

    const results = await composedQuery
      .orderBy(desc(table_sales_order.createdAt))
      .limit(limit)
      .offset(offset);

    const total = results.length > 0 ? results[0].total : 0;

    const list = results.map((row) => ({
      id: row.id,
      code: row.code,
      customerName: row.customerName,
      status: row.status,
      warehouseId: row.warehouseId ?? undefined,
      expectedDate: row.expectedDate?.getTime(),
      totalAmount: row.totalAmount ?? "0",
      currency: row.currency ?? "USD",
      notes: row.notes ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    }));

    return this.getPagination({
      data: list,
      total,
    });
  };
}

export default ListSalesOrderModel;

