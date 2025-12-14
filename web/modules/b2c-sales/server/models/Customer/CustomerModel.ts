import { desc, eq } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";
import getDbConnect from "@base/server/utils/getDbConnect";
import type {
  CreateCustomerCompanyInput,
  CreateCustomerIndividualInput,
  UpdateCustomerCompanyInput,
  UpdateCustomerIndividualInput,
} from "../../models/interfaces/Customer";
import type {
  NewSaleB2cTbCustomer,
  NewSaleB2cTbCustomerCompany,
  SaleB2cTbCustomer,
  SaleB2cTbCustomerCompany,
} from "../../schemas";
import {
  sale_b2c_tb_customer_companies,
  sale_b2c_tb_customers,
} from "../../schemas";

export default class CustomerModel {
  private companyModel: BaseModel<typeof sale_b2c_tb_customer_companies>;
  private individualModel: BaseModel<typeof sale_b2c_tb_customers>;

  constructor() {
    this.companyModel = new BaseModel(sale_b2c_tb_customer_companies);
    this.individualModel = new BaseModel(sale_b2c_tb_customers);
  }

  // Company methods
  listCompanies = async (): Promise<SaleB2cTbCustomerCompany[]> => {
    const db = getDbConnect();
    return db
      .select()
      .from(sale_b2c_tb_customer_companies)
      .orderBy(desc(sale_b2c_tb_customer_companies.createdAt));
  };

  getCompanyById = async (
    id: string
  ): Promise<SaleB2cTbCustomerCompany | null> => {
    const db = getDbConnect();
    const [company] = await db
      .select()
      .from(sale_b2c_tb_customer_companies)
      .where(eq(sale_b2c_tb_customer_companies.id, id))
      .limit(1);
    return company ?? null;
  };

  createCompany = async (input: CreateCustomerCompanyInput) => {
    const now = new Date();
    const generatedCode =
      input.code?.trim() ||
      `CUST-COMP-${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now
        .getDate()
        .toString()
        .padStart(
          2,
          "0"
        )}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const payload: NewSaleB2cTbCustomerCompany = {
      code: generatedCode,
      name: input.name.trim(),
      taxId: input.taxId,
      address: input.address,
      phone: input.phone,
      email: input.email,
      website: input.website,
      contactPerson: input.contactPerson,
      creditLimit: input.creditLimit?.toString(),
      paymentTermsId: input.paymentTermsId,
      isActive: input.isActive ?? true,
      notes: input.notes,
      createdBy: input.userId,
    };

    const db = getDbConnect();
    const [company] = await db
      .insert(sale_b2c_tb_customer_companies)
      .values(payload)
      .returning();

    return company;
  };

  updateCompany = async (input: UpdateCustomerCompanyInput) => {
    const now = new Date();
    const updatePayload: Partial<NewSaleB2cTbCustomerCompany> = {
      name: input.name?.trim(),
      taxId: input.taxId,
      address: input.address,
      phone: input.phone,
      email: input.email,
      website: input.website,
      contactPerson: input.contactPerson,
      creditLimit: input.creditLimit?.toString(),
      paymentTermsId: input.paymentTermsId,
      isActive: input.isActive,
      notes: input.notes,
      updatedAt: now,
      updatedBy: input.userId,
    };

    const db = getDbConnect();
    const [updated] = await db
      .update(sale_b2c_tb_customer_companies)
      .set(updatePayload)
      .where(eq(sale_b2c_tb_customer_companies.id, input.id))
      .returning();

    if (!updated) {
      throw new Error("Customer company not found");
    }

    return updated;
  };

  // Individual methods
  listIndividuals = async (): Promise<SaleB2cTbCustomer[]> => {
    const db = getDbConnect();
    return db
      .select()
      .from(sale_b2c_tb_customers)
      .orderBy(desc(sale_b2c_tb_customers.createdAt));
  };

  getIndividualById = async (id: string): Promise<SaleB2cTbCustomer | null> => {
    const db = getDbConnect();
    const [individual] = await db
      .select()
      .from(sale_b2c_tb_customers)
      .where(eq(sale_b2c_tb_customers.id, id))
      .limit(1);
    return individual ?? null;
  };

  createIndividual = async (input: CreateCustomerIndividualInput) => {
    const now = new Date();
    const generatedCode =
      input.code?.trim() ||
      `CUST-IND-${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now
        .getDate()
        .toString()
        .padStart(
          2,
          "0"
        )}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const payload: NewSaleB2cTbCustomer = {
      code: generatedCode,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone,
      email: input.email,
      address: input.address,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      gender: input.gender,
      isActive: input.isActive ?? true,
      notes: input.notes,
      createdBy: input.userId,
    };

    const db = getDbConnect();
    const [individual] = await db
      .insert(sale_b2c_tb_customers)
      .values(payload)
      .returning();

    return individual;
  };

  updateIndividual = async (input: UpdateCustomerIndividualInput) => {
    const now = new Date();
    const updatePayload: Partial<NewSaleB2cTbCustomer> = {
      firstName: input.firstName?.trim(),
      lastName: input.lastName?.trim(),
      phone: input.phone,
      email: input.email,
      address: input.address,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      gender: input.gender,
      isActive: input.isActive,
      notes: input.notes,
      updatedAt: now,
      updatedBy: input.userId,
    };

    const db = getDbConnect();
    const [updated] = await db
      .update(sale_b2c_tb_customers)
      .set(updatePayload)
      .where(eq(sale_b2c_tb_customers.id, input.id))
      .returning();

    if (!updated) {
      throw new Error("Customer individual not found");
    }

    return updated;
  };
}
