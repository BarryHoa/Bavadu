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
