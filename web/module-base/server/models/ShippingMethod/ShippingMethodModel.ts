import { asc, eq } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";
import type { TblShippingMethod } from "../../schemas/shipping-method";
import { table_shipping_method } from "../../schemas/shipping-method";

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

  getOptionsDropdown = async (): Promise<{
    data: Array<{
      label: string;
      value: string;
      code: string;
      name: any;
      [key: string]: any;
    }>;
    total: number;
  }> => {
    const items = await this.getList();
    return {
      data: items.map((item) => {
        // Handle LocaleDataType<string> for name
        const name =
          typeof item.name === "string"
            ? item.name
            : item.name?.vi || item.name?.en || item.code || "";

        return {
          label: `${item.code} - ${name}`,
          value: item.id,
          code: item.code,
          name: item.name,
        };
      }),
      total: items.length,
    };
  };
}
