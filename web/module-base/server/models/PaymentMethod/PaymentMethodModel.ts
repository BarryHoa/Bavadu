import { asc, eq } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";
import { table_payment_method } from "../../schemas/payment-method";
import type { TblPaymentMethod } from "../../schemas/payment-method";

export default class PaymentMethodModel extends BaseModel<
  typeof table_payment_method
> {
  constructor() {
    super(table_payment_method);
  }

  getList = async (): Promise<TblPaymentMethod[]> => {
    return this.db
      .select()
      .from(table_payment_method)
      .where(eq(table_payment_method.isActive, true))
      .orderBy(asc(table_payment_method.order));
  };
}

