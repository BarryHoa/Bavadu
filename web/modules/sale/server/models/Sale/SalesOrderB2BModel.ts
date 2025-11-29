import { desc, eq, sql } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";
import { getEnv } from "@base/server";
import {
  table_sales_order_b2b,
  table_sales_order_line_b2b,
  table_order_currency_rate,
} from "../../schemas";
import {
  table_currency,
  table_currency_exchange_rate,
} from "@base/server/schemas/currency";
import type {
  NewTblSalesOrderB2B,
  TblSalesOrderB2B,
  TblSalesOrderLineB2B,
} from "../../schemas";
import type {
  SalesOrderB2BStatus,
  CreateSalesOrderB2BInput,
  UpdateSalesOrderB2BInput,
  DeliverSalesOrderB2BInput,
} from "../interfaces/SalesOrderB2B";
import type StockModel from "../../../../stock/server/models/Stock/StockModel";

export default class SalesOrderB2BModel extends BaseModel<
  typeof table_sales_order_b2b
> {
  constructor() {
    super(table_sales_order_b2b);
  }

  list = async (): Promise<TblSalesOrderB2B[]> => {
    return this.db
      .select()
      .from(table_sales_order_b2b)
      .orderBy(desc(table_sales_order_b2b.createdAt));
  };

  getById = async (id: string) => {
    const [order] = await this.db
      .select()
      .from(table_sales_order_b2b)
      .where(eq(table_sales_order_b2b.id, id))
      .limit(1);
    if (!order) {
      return null;
    }
    const lines = await this.db
      .select()
      .from(table_sales_order_line_b2b)
      .where(eq(table_sales_order_line_b2b.orderId, order.id));
    return { order, lines };
  };

  create = async (input: CreateSalesOrderB2BInput) => {
    if (!input.lines?.length) {
      throw new Error("Sales order requires at least one line");
    }

    const now = new Date();
    const generatedCode =
      input.code?.trim() ||
      `SO-B2B-${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now
        .getDate()
        .toString()
        .padStart(2, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Get currency rate
    const currency = input.currency ?? "USD";
    let currencyRate: number | undefined;
    try {
      const [currencyRecord] = await this.db
        .select()
        .from(table_currency)
        .where(eq(table_currency.code, currency))
        .limit(1);
      
      if (currencyRecord) {
        const [latestRate] = await this.db
          .select()
          .from(table_currency_exchange_rate)
          .where(eq(table_currency_exchange_rate.currencyId, currencyRecord.id))
          .orderBy(desc(table_currency_exchange_rate.rateDate))
          .limit(1);
        
        if (latestRate?.exchangeRate) {
          currencyRate = Number(latestRate.exchangeRate);
        }
      }
    } catch (error) {
      console.warn("Failed to get currency rate:", error);
    }

    return this.db.transaction(async (tx) => {
      let subtotal = 0;
      let totalDiscount = input.totalDiscount ?? 0;
      let totalTax = input.totalTax ?? 0;
      const shippingFee = input.shippingFee ?? 0;

      // Calculate line totals
      const lineData: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
        description?: string;
        lineDiscount: number;
        taxRate: number;
        lineSubtotal: number;
        lineTax: number;
        lineTotal: number;
      }> = [];

      for (const line of input.lines) {
        const quantity = Number(line.quantity ?? 0);
        if (quantity <= 0) continue;

        const unitPrice = Number(line.unitPrice ?? 0);
        const lineDiscount = Number(line.lineDiscount ?? 0);
        const taxRate = Number(line.taxRate ?? 0);
        
        const lineSubtotal = quantity * unitPrice;
        const lineTax = ((lineSubtotal - lineDiscount) * taxRate) / 100;
        const lineTotal = lineSubtotal - lineDiscount + lineTax;

        subtotal += lineSubtotal;
        totalTax += lineTax;

        lineData.push({
          productId: line.productId,
          quantity,
          unitPrice,
          description: line.description,
          lineDiscount,
          taxRate,
          lineSubtotal,
          lineTax,
          lineTotal,
        });
      }

      const grandTotal = subtotal - totalDiscount + totalTax + shippingFee;

      const orderPayload: NewTblSalesOrderB2B = {
        code: generatedCode,
        companyName: input.companyName.trim(),
        taxId: input.taxId,
        contactPerson: input.contactPerson,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
        companyAddress: input.companyAddress,
        paymentTermsId: input.paymentTermsId,
        creditLimit: input.creditLimit?.toString(),
        invoiceRequired: input.invoiceRequired ?? true,
        shippingMethodId: input.shippingMethodId,
        shippingTermsId: input.shippingTermsId,
        status: "draft",
        expectedDate: input.expectedDate
          ? new Date(input.expectedDate)
          : undefined,
        warehouseId: input.warehouseId,
        currency: currency,
        currencyRate: currencyRate?.toString(),
        notes: input.notes,
        subtotal: subtotal.toString(),
        totalDiscount: totalDiscount.toString(),
        totalTax: totalTax.toString(),
        shippingFee: shippingFee.toString(),
        grandTotal: grandTotal.toString(),
        totalAmount: grandTotal.toString(),
        createdBy: input.userId,
      };

      const [order] = await tx
        .insert(table_sales_order_b2b)
        .values(orderPayload)
        .returning();

      // Save currency rate snapshot
      if (currencyRate) {
        await tx.insert(table_order_currency_rate).values({
          orderType: "B2B",
          orderId: order.id,
          currencyCode: currency,
          exchangeRate: currencyRate.toString(),
          rateDate: now,
          source: "api",
        });
      }

      // Insert lines
      for (const line of lineData) {
        await tx.insert(table_sales_order_line_b2b).values({
          orderId: order.id,
          productId: line.productId,
          description: line.description,
          quantityOrdered: line.quantity.toString(),
          quantityDelivered: "0",
          unitPrice: line.unitPrice.toString(),
          lineDiscount: line.lineDiscount.toString(),
          taxRate: line.taxRate.toString(),
          lineTax: line.lineTax.toString(),
          lineSubtotal: line.lineSubtotal.toString(),
          lineTotal: line.lineTotal.toString(),
        });
      }

      await tx
        .update(table_sales_order_b2b)
        .set({
          updatedAt: now,
        })
        .where(eq(table_sales_order_b2b.id, order.id));

      const result = await this.getById(order.id);
      if (!result) {
        throw new Error("Failed to load sales order after creation");
      }
      return result;
    });
  };

  update = async (input: UpdateSalesOrderB2BInput) => {
    const orderData = await this.getById(input.id);
    if (!orderData) {
      throw new Error("Sales order not found");
    }

    if (!input.lines?.length) {
      throw new Error("Sales order requires at least one line");
    }

    const now = new Date();
    let subtotal = 0;
    let totalDiscount = input.totalDiscount ?? Number(orderData.order.totalDiscount);
    let totalTax = input.totalTax ?? Number(orderData.order.totalTax);
    const shippingFee = input.shippingFee ?? Number(orderData.order.shippingFee);

    // Calculate line totals
    const lineData: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      description?: string;
      lineDiscount: number;
      taxRate: number;
      lineSubtotal: number;
      lineTax: number;
      lineTotal: number;
    }> = [];

    for (const line of input.lines) {
      const quantity = Number(line.quantity ?? 0);
      if (quantity <= 0) continue;

      const unitPrice = Number(line.unitPrice ?? 0);
      const lineDiscount = Number(line.lineDiscount ?? 0);
      const taxRate = Number(line.taxRate ?? 0);
      
      const lineSubtotal = quantity * unitPrice;
      const lineTax = ((lineSubtotal - lineDiscount) * taxRate) / 100;
      const lineTotal = lineSubtotal - lineDiscount + lineTax;

      subtotal += lineSubtotal;
      totalTax += lineTax;

      lineData.push({
        productId: line.productId,
        quantity,
        unitPrice,
        description: line.description,
        lineDiscount,
        taxRate,
        lineSubtotal,
        lineTax,
        lineTotal,
      });
    }

    const grandTotal = subtotal - totalDiscount + totalTax + shippingFee;

    return this.db.transaction(async (tx) => {
      // Update order
      const updatePayload: Partial<NewTblSalesOrderB2B> = {
        companyName: input.companyName?.trim(),
        taxId: input.taxId,
        contactPerson: input.contactPerson,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
        companyAddress: input.companyAddress,
        paymentTermsId: input.paymentTermsId,
        creditLimit: input.creditLimit?.toString(),
        invoiceRequired: input.invoiceRequired,
        shippingMethodId: input.shippingMethodId,
        shippingTermsId: input.shippingTermsId,
        expectedDate: input.expectedDate
          ? new Date(input.expectedDate)
          : undefined,
        warehouseId: input.warehouseId,
        currency: input.currency,
        notes: input.notes,
        subtotal: subtotal.toString(),
        totalDiscount: totalDiscount.toString(),
        totalTax: totalTax.toString(),
        shippingFee: shippingFee.toString(),
        grandTotal: grandTotal.toString(),
        totalAmount: grandTotal.toString(),
        updatedAt: now,
      };

      await tx
        .update(table_sales_order_b2b)
        .set(updatePayload)
        .where(eq(table_sales_order_b2b.id, input.id));

      // Delete existing lines
      await tx
        .delete(table_sales_order_line_b2b)
        .where(eq(table_sales_order_line_b2b.orderId, input.id));

      // Insert new lines
      for (const line of lineData) {
        await tx.insert(table_sales_order_line_b2b).values({
          orderId: input.id,
          productId: line.productId,
          description: line.description,
          quantityOrdered: line.quantity.toString(),
          quantityDelivered: "0",
          unitPrice: line.unitPrice.toString(),
          lineDiscount: line.lineDiscount.toString(),
          taxRate: line.taxRate.toString(),
          lineTax: line.lineTax.toString(),
          lineSubtotal: line.lineSubtotal.toString(),
          lineTotal: line.lineTotal.toString(),
        });
      }

      return this.getById(input.id);
    });
  };

  send = async (orderId: string) => {
    const [updated] = await this.db
      .update(table_sales_order_b2b)
      .set({
        status: "sent",
        updatedAt: sql`now()`,
      })
      .where(eq(table_sales_order_b2b.id, orderId))
      .returning();

    if (!updated) {
      throw new Error("Sales order not found");
    }

    return updated;
  };

  deliver = async (input: DeliverSalesOrderB2BInput) => {
    const env = getEnv();
    const stockModel = env.getModel("stock") as StockModel | undefined;

    if (!stockModel) {
      throw new Error("Stock model is not registered");
    }

    const orderData = await this.getById(input.orderId);
    if (!orderData) {
      throw new Error("Sales order not found");
    }
    const { order, lines } = orderData;

    const defaultWarehouseId =
      input.warehouseId ?? order.warehouseId ?? undefined;

    if (!defaultWarehouseId) {
      throw new Error("Warehouse is required to deliver sales order");
    }

    const linesById = new Map<string, TblSalesOrderLineB2B>();
    for (const line of lines) {
      linesById.set(line.id, line);
    }

    const now = new Date();

    await this.db.transaction(async (tx) => {
      for (const deliveredLine of input.lines) {
        const line = linesById.get(deliveredLine.lineId);
        if (!line) {
          throw new Error(
            `Sales order line ${deliveredLine.lineId} not found`
          );
        }

        const quantity = Number(deliveredLine.quantity ?? 0);
        if (quantity <= 0) continue;

        const alreadyDelivered = Number(line.quantityDelivered ?? 0);
        const orderedQty = Number(line.quantityOrdered ?? 0);
        const nextDelivered = alreadyDelivered + quantity;

        if (nextDelivered - orderedQty > 0.0001) {
          throw new Error(
            `Cannot deliver more than ordered for product ${line.productId}`
          );
        }

        await tx
          .update(table_sales_order_line_b2b)
          .set({
            quantityDelivered: nextDelivered.toString(),
            updatedAt: now,
          })
          .where(eq(table_sales_order_line_b2b.id, line.id));

        await stockModel.issueStock({
          productId: line.productId,
          warehouseId: defaultWarehouseId,
          quantity,
          reference: `SO-B2B:${order.code}`,
          note: input.note,
          userId: input.userId,
        });
      }

      const [sumRow] = await tx
        .select({
          undeliveredCount: sql`
            count(*) FILTER (
              WHERE ${table_sales_order_line_b2b.quantityOrdered} > ${table_sales_order_line_b2b.quantityDelivered}
            )
          `,
        })
        .from(table_sales_order_line_b2b)
        .where(eq(table_sales_order_line_b2b.orderId, order.id));

      const status: SalesOrderB2BStatus =
        Number(sumRow?.undeliveredCount ?? 0) === 0 ? "delivered" : "sent";

      await tx
        .update(table_sales_order_b2b)
        .set({
          status,
          warehouseId: defaultWarehouseId,
          updatedAt: now,
        })
        .where(eq(table_sales_order_b2b.id, order.id));
    });

    return this.getById(order.id);
  };

  cancel = async (orderId: string) => {
    const [updated] = await this.db
      .update(table_sales_order_b2b)
      .set({
        status: "cancelled",
        updatedAt: sql`now()`,
      })
      .where(eq(table_sales_order_b2b.id, orderId))
      .returning();

    if (!updated) {
      throw new Error("Sales order not found");
    }

    return updated;
  };
}

