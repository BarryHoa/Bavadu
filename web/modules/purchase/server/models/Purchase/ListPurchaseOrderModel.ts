import { and, desc, eq, sql } from "drizzle-orm";

import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import { getEnv } from "@base/server";
import {
  table_purchase_order,
} from "../../schemas";

class ListPurchaseOrderModel extends BaseViewListModel<
  typeof table_purchase_order
> {
  constructor() {
    super(table_purchase_order);
  }

  getViewDataList = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<any>> => {
    const env = getEnv();
    const db = env.getDb();

    const { offset, limit, search } = this.getDefaultParamsForList(params);

    const baseQuery = db
      .select({
        id: table_purchase_order.id,
        code: table_purchase_order.code,
        vendorName: table_purchase_order.vendorName,
        status: table_purchase_order.status,
        expectedDate: table_purchase_order.expectedDate,
        warehouseId: table_purchase_order.warehouseId,
        totalAmount: table_purchase_order.totalAmount,
        currency: table_purchase_order.currency,
        notes: table_purchase_order.notes,
        createdAt: table_purchase_order.createdAt,
        updatedAt: table_purchase_order.updatedAt,
        total: sql<number>`count(*) over()::int`.as("total"),
      })
      .from(table_purchase_order);

    let composedQuery = baseQuery;
    if (search) {
      composedQuery = composedQuery.where(
        sql`(${table_purchase_order.code} ILIKE ${`%${search}%`} OR ${table_purchase_order.vendorName} ILIKE ${`%${search}%`})`
      ) as typeof composedQuery;
    }

    const results = await composedQuery
      .orderBy(desc(table_purchase_order.createdAt))
      .limit(limit)
      .offset(offset);

    const total = results.length > 0 ? results[0].total : 0;

    const list = results.map((row) => ({
      id: row.id,
      code: row.code,
      vendorName: row.vendorName,
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

export default ListPurchaseOrderModel;

