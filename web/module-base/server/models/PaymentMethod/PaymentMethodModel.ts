import { asc, eq } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";
import type { TblPaymentMethod } from "../../schemas/payment-method";
import { table_payment_method } from "../../schemas/payment-method";

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
