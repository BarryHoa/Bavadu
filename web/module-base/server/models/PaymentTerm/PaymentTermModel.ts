import { asc, eq } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";
import type { TblPaymentTerm } from "../../schemas/payment-term";
import { table_payment_term } from "../../schemas/payment-term";

export default class PaymentTermModel extends BaseModel<
  typeof table_payment_term
> {
  constructor() {
    super(table_payment_term);
  }

  getList = async (): Promise<TblPaymentTerm[]> => {
    return this.db
      .select()
      .from(table_payment_term)
      .where(eq(table_payment_term.isActive, true))
      .orderBy(asc(table_payment_term.order));
  };
}
