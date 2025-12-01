import { asc, eq } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";
import type { TblTaxRate } from "../../schemas/tax-rate";
import { table_tax_rate } from "../../schemas/tax-rate";

export default class TaxRateModel extends BaseModel<typeof table_tax_rate> {
  constructor() {
    super(table_tax_rate);
  }

  getList = async (): Promise<TblTaxRate[]> => {
    return this.db
      .select()
      .from(table_tax_rate)
      .where(eq(table_tax_rate.isActive, true))
      .orderBy(asc(table_tax_rate.order));
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
