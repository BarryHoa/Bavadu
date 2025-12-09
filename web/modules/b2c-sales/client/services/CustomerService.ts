import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export interface CustomerCompanyDto {
  id: string;
  code: string;
  name: string;
  taxId?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  contactPerson?: string | null;
  creditLimit?: string | null;
  paymentTermsId?: string | null;
  isActive: boolean;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface CustomerIndividualDto {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  isActive: boolean;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export default class CustomerService extends JsonRpcClientService {
  // Company methods (not used in B2C but kept for consistency)
  listCompanies() {
    return this.call<{
      data: CustomerCompanyDto[];
      message?: string;
    }>("b2c-sales-customer.curd.list", {});
  }

  getCompanyById(id: string) {
    return this.call<{
      data: CustomerCompanyDto;
      message?: string;
    }>("b2c-sales-customer.curd.getById", { id });
  }

  createCompany(payload: {
    code?: string;
    name: string;
    taxId?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    contactPerson?: string;
    creditLimit?: number;
    paymentTermsId?: string;
    isActive?: boolean;
    notes?: string;
    userId?: string;
  }) {
    return this.call<{
      data: CustomerCompanyDto;
      message?: string;
    }>("b2c-sales-customer.curd.create", payload);
  }

  updateCompany(payload: {
    id: string;
    code?: string;
    name?: string;
    taxId?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    contactPerson?: string;
    creditLimit?: number;
    paymentTermsId?: string;
    isActive?: boolean;
    notes?: string;
    userId?: string;
  }) {
    return this.call<{
      data: CustomerCompanyDto;
      message?: string;
    }>("b2c-sales-customer.curd.update", payload);
  }

  // Individual methods
  listIndividuals() {
    return this.call<{
      data: CustomerIndividualDto[];
      message?: string;
    }>("b2c-sales-customer-individual.list.getData", {});
  }

  getIndividualById(id: string) {
    return this.call<{
      data: CustomerIndividualDto;
      message?: string;
    }>("b2c-sales-customer.curd.getById", { id });
  }

  createIndividual(payload: {
    code?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
    isActive?: boolean;
    notes?: string;
    userId?: string;
  }) {
    return this.call<{
      data: CustomerIndividualDto;
      message?: string;
    }>("b2c-sales-customer.curd.create", payload);
  }

  updateIndividual(payload: {
    id: string;
    code?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
    isActive?: boolean;
    notes?: string;
    userId?: string;
  }) {
    return this.call<{
      data: CustomerIndividualDto;
      message?: string;
    }>("b2c-sales-customer.curd.update", payload);
  }
}

export const customerService = new CustomerService();
