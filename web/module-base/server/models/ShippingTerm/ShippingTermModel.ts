import { asc, eq } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";
import type { TblShippingTerm } from "../../schemas/shipping-term";
import { table_shipping_term } from "../../schemas/shipping-term";

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
