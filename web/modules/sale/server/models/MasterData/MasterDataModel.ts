import { asc, eq } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";
import {
  table_payment_method,
  table_payment_term,
  table_shipping_method,
  table_shipping_term,
  table_tax_rate,
} from "../../schemas";
import type {
  TblPaymentMethod,
  TblPaymentTerm,
  TblShippingMethod,
  TblShippingTerm,
  TblTaxRate,
} from "../../schemas";

export default class MasterDataModel {
  private paymentMethodModel: BaseModel<typeof table_payment_method>;
  private paymentTermModel: BaseModel<typeof table_payment_term>;
  private shippingMethodModel: BaseModel<typeof table_shipping_method>;
  private shippingTermModel: BaseModel<typeof table_shipping_term>;
  private taxRateModel: BaseModel<typeof table_tax_rate>;

  constructor() {
    this.paymentMethodModel = new BaseModel(table_payment_method);
    this.paymentTermModel = new BaseModel(table_payment_term);
    this.shippingMethodModel = new BaseModel(table_shipping_method);
    this.shippingTermModel = new BaseModel(table_shipping_term);
    this.taxRateModel = new BaseModel(table_tax_rate);
  }

  getPaymentMethods = async (): Promise<TblPaymentMethod[]> => {
    return this.paymentMethodModel.db
      .select()
      .from(table_payment_method)
      .where(eq(table_payment_method.isActive, true))
      .orderBy(asc(table_payment_method.order));
  };

  getPaymentTerms = async (): Promise<TblPaymentTerm[]> => {
    return this.paymentTermModel.db
      .select()
      .from(table_payment_term)
      .where(eq(table_payment_term.isActive, true))
      .orderBy(asc(table_payment_term.order));
  };

  getShippingMethods = async (): Promise<TblShippingMethod[]> => {
    return this.shippingMethodModel.db
      .select()
      .from(table_shipping_method)
      .where(eq(table_shipping_method.isActive, true))
      .orderBy(asc(table_shipping_method.order));
  };

  getShippingTerms = async (): Promise<TblShippingTerm[]> => {
    return this.shippingTermModel.db
      .select()
      .from(table_shipping_term)
      .where(eq(table_shipping_term.isActive, true))
      .orderBy(asc(table_shipping_term.order));
  };

  getTaxRates = async (): Promise<TblTaxRate[]> => {
    return this.taxRateModel.db
      .select()
      .from(table_tax_rate)
      .where(eq(table_tax_rate.isActive, true))
      .orderBy(asc(table_tax_rate.order));
  };
}

