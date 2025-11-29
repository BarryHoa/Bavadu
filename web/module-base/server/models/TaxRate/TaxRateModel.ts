import { asc, eq } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";
import { table_tax_rate } from "../../schemas/tax-rate";
import type { TblTaxRate } from "../../schemas/tax-rate";

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
}

