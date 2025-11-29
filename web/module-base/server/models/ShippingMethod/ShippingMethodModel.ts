import { asc, eq } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";
import { table_shipping_method } from "../../schemas/shipping-method";
import type { TblShippingMethod } from "../../schemas/shipping-method";

export default class ShippingMethodModel extends BaseModel<
  typeof table_shipping_method
> {
  constructor() {
    super(table_shipping_method);
  }

  getList = async (): Promise<TblShippingMethod[]> => {
    return this.db
      .select()
      .from(table_shipping_method)
      .where(eq(table_shipping_method.isActive, true))
      .orderBy(asc(table_shipping_method.order));
  };
}

