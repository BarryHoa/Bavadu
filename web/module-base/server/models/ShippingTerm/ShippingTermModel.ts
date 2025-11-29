import { asc, eq } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";
import { table_shipping_term } from "../../schemas/shipping-term";
import type { TblShippingTerm } from "../../schemas/shipping-term";

export default class ShippingTermModel extends BaseModel<
  typeof table_shipping_term
> {
  constructor() {
    super(table_shipping_term);
  }

  getList = async (): Promise<TblShippingTerm[]> => {
    return this.db
      .select()
      .from(table_shipping_term)
      .where(eq(table_shipping_term.isActive, true))
      .orderBy(asc(table_shipping_term.order));
  };
}

