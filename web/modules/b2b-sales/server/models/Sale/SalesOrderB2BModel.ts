import { desc, eq, sql } from "drizzle-orm";

import { RuntimeContext } from "@base/server/runtime/RuntimeContext";
import { BaseModel } from "@base/server/models/BaseModel";
import {
  base_tb_currencies,
  base_tb_currencies_exchange_rate,
} from "@base/server/schemas";
import type StockModel from "@mdl/stock/server/models/Stock/StockModel";
import type {
  CreateSalesOrderB2BInput,
  DeliverSalesOrderB2BInput,
  SalesOrderB2BStatus,
  UpdateSalesOrderB2BInput,
} from "../interfaces/SalesOrderB2B";
import type {
  NewSaleB2bTbOrder,
  SaleB2bTbOrder,
  SaleB2bTbOrderLine,
} from "../../schemas";
import {
  sale_b2c_tb_currency_rates,
  sale_b2b_tb_orders,
  sale_b2b_tb_order_lines,
} from "../../schemas";

export default class SalesOrderB2BModel extends BaseModel<
  typeof sale_b2b_tb_orders
> {
  constructor() {
    super(sale_b2b_tb_orders);
  }

  list = async (): Promise<SaleB2bTbOrder[]> => {
    return this.db
      .select()
      .from(sale_b2b_tb_orders)
      .orderBy(desc(sale_b2b_tb_orders.createdAt));
  };

  getById = async (id: string) => {
    const [order] = await this.db
      .select()
      .from(sale_b2b_tb_orders)
      .where(eq(sale_b2b_tb_orders.id, id))
      .limit(1);
    if (!order) {
      return null;
    }
    const lines = await this.db
      .select()
      .from(sale_b2b_tb_order_lines)
      .where(eq(sale_b2b_tb_order_lines.orderId, order.id));
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
        .padStart(
          2,
          "0"
        )}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Get currency rate
    const currency = input.currency ?? "USD";
    let currencyRate: number | undefined;
    try {
      const [currencyRecord] = await this.db
        .select()
        .from(base_tb_currencies)
        .where(eq(base_tb_currencies.code, currency))
        .limit(1);

      if (currencyRecord) {
        const [latestRate] = await this.db
          .select()
          .from(base_tb_currencies_exchange_rate)
          .where(eq(base_tb_currencies_exchange_rate.currencyId, currencyRecord.id))
          .orderBy(desc(base_tb_currencies_exchange_rate.rateDate))
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

      const orderPayload: NewSaleB2bTbOrder = {
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
        .insert(sale_b2b_tb_orders)
        .values(orderPayload)
        .returning();

      // Save currency rate snapshot
      if (currencyRate) {
        await tx.insert(sale_b2c_tb_currency_rates).values({
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
        await tx.insert(sale_b2b_tb_order_lines).values({
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
        .update(sale_b2b_tb_orders)
        .set({
          updatedAt: now,
        })
        .where(eq(sale_b2b_tb_orders.id, order.id));

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
    let totalDiscount =
      input.totalDiscount ?? Number(orderData.order.totalDiscount);
    let totalTax = input.totalTax ?? Number(orderData.order.totalTax);
    const shippingFee =
      input.shippingFee ?? Number(orderData.order.shippingFee);

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
      const updatePayload: Partial<NewSaleB2bTbOrder> = {
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
        .update(sale_b2b_tb_orders)
        .set(updatePayload)
        .where(eq(sale_b2b_tb_orders.id, input.id));

      // Delete existing lines
      await tx
        .delete(sale_b2b_tb_order_lines)
        .where(eq(sale_b2b_tb_order_lines.orderId, input.id));

      // Insert new lines
      for (const line of lineData) {
        await tx.insert(sale_b2b_tb_order_lines).values({
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
      .update(sale_b2b_tb_orders)
      .set({
        status: "sent",
        updatedAt: sql`now()`,
      })
      .where(eq(sale_b2b_tb_orders.id, orderId))
      .returning();

    if (!updated) {
      throw new Error("Sales order not found");
    }

    return updated;
  };

  deliver = async (input: DeliverSalesOrderB2BInput) => {
    const stockModel = await RuntimeContext.getModelInstanceBy<StockModel>("stock");

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

    const linesById = new Map<string, SaleB2bTbOrderLine>();
    for (const line of lines) {
      linesById.set(line.id, line);
    }

    const now = new Date();

    await this.db.transaction(async (tx) => {
      for (const deliveredLine of input.lines) {
        const line = linesById.get(deliveredLine.lineId);
        if (!line) {
          throw new Error(`Sales order line ${deliveredLine.lineId} not found`);
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
          .update(sale_b2b_tb_order_lines)
          .set({
            quantityDelivered: nextDelivered.toString(),
            updatedAt: now,
          })
          .where(eq(sale_b2b_tb_order_lines.id, line.id));

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
              WHERE ${sale_b2b_tb_order_lines.quantityOrdered} > ${sale_b2b_tb_order_lines.quantityDelivered}
            )
          `,
        })
        .from(sale_b2b_tb_order_lines)
        .where(eq(sale_b2b_tb_order_lines.orderId, order.id));

      const status: SalesOrderB2BStatus =
        Number(sumRow?.undeliveredCount ?? 0) === 0 ? "delivered" : "sent";

      await tx
        .update(sale_b2b_tb_orders)
        .set({
          status,
          warehouseId: defaultWarehouseId,
          updatedAt: now,
        })
        .where(eq(sale_b2b_tb_orders.id, order.id));
    });

    return this.getById(order.id);
  };

  cancel = async (orderId: string) => {
    const [updated] = await this.db
      .update(sale_b2b_tb_orders)
      .set({
        status: "cancelled",
        updatedAt: sql`now()`,
      })
      .where(eq(sale_b2b_tb_orders.id, orderId))
      .returning();

    if (!updated) {
      throw new Error("Sales order not found");
    }

    return updated;
  };
}
