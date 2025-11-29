import { desc, eq } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";
import {
  table_customer_company,
  table_customer_individual,
} from "../../schemas";
import type {
  NewTblCustomerCompany,
  TblCustomerCompany,
  NewTblCustomerIndividual,
  TblCustomerIndividual,
} from "../../schemas";
import type {
  CreateCustomerCompanyInput,
  UpdateCustomerCompanyInput,
  CreateCustomerIndividualInput,
  UpdateCustomerIndividualInput,
} from "../../models/interfaces/Customer";

export default class CustomerModel {
  private companyModel: BaseModel<typeof table_customer_company>;
  private individualModel: BaseModel<typeof table_customer_individual>;

  constructor() {
    this.companyModel = new BaseModel(table_customer_company);
    this.individualModel = new BaseModel(table_customer_individual);
  }

  // Company methods
  listCompanies = async (): Promise<TblCustomerCompany[]> => {
    return this.companyModel.db
      .select()
      .from(table_customer_company)
      .orderBy(desc(table_customer_company.createdAt));
  };

  getCompanyById = async (id: string): Promise<TblCustomerCompany | null> => {
    const [company] = await this.companyModel.db
      .select()
      .from(table_customer_company)
      .where(eq(table_customer_company.id, id))
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
        .padStart(2, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const payload: NewTblCustomerCompany = {
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

    const [company] = await this.companyModel.db
      .insert(table_customer_company)
      .values(payload)
      .returning();

    return company;
  };

  updateCompany = async (input: UpdateCustomerCompanyInput) => {
    const now = new Date();
    const updatePayload: Partial<NewTblCustomerCompany> = {
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

    const [updated] = await this.companyModel.db
      .update(table_customer_company)
      .set(updatePayload)
      .where(eq(table_customer_company.id, input.id))
      .returning();

    if (!updated) {
      throw new Error("Customer company not found");
    }

    return updated;
  };

  // Individual methods
  listIndividuals = async (): Promise<TblCustomerIndividual[]> => {
    return this.individualModel.db
      .select()
      .from(table_customer_individual)
      .orderBy(desc(table_customer_individual.createdAt));
  };

  getIndividualById = async (id: string): Promise<TblCustomerIndividual | null> => {
    const [individual] = await this.individualModel.db
      .select()
      .from(table_customer_individual)
      .where(eq(table_customer_individual.id, id))
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
        .padStart(2, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const payload: NewTblCustomerIndividual = {
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

    const [individual] = await this.individualModel.db
      .insert(table_customer_individual)
      .values(payload)
      .returning();

    return individual;
  };

  updateIndividual = async (input: UpdateCustomerIndividualInput) => {
    const now = new Date();
    const updatePayload: Partial<NewTblCustomerIndividual> = {
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

    const [updated] = await this.individualModel.db
      .update(table_customer_individual)
      .set(updatePayload)
      .where(eq(table_customer_individual.id, input.id))
      .returning();

    if (!updated) {
      throw new Error("Customer individual not found");
    }

    return updated;
  };
}

