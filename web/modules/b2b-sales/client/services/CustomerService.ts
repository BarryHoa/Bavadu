import ClientHttpService from "@base/client/services/ClientHttpService";

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

export default class CustomerService extends ClientHttpService {
  constructor() {
    super("/api/modules/b2b-sales/customers");
  }

  // Company methods
  listCompanies() {
    return this.get<{
      data: CustomerCompanyDto[];
      message?: string;
    }>("/companies");
  }

  getCompanyById(id: string) {
    return this.get<{
      data: CustomerCompanyDto;
      message?: string;
    }>(`/companies/detail?id=${id}`);
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
    return this.post<{
      data: CustomerCompanyDto;
      message?: string;
    }>("/companies/create", payload);
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
    return this.put<{
      data: CustomerCompanyDto;
      message?: string;
    }>("/companies/update", payload);
  }

  // Individual methods
  listIndividuals() {
    return this.get<{
      data: CustomerIndividualDto[];
      message?: string;
    }>("/individuals");
  }

  getIndividualById(id: string) {
    return this.get<{
      data: CustomerIndividualDto;
      message?: string;
    }>(`/individuals/detail?id=${id}`);
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
    return this.post<{
      data: CustomerIndividualDto;
      message?: string;
    }>("/individuals/create", payload);
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
    return this.put<{
      data: CustomerIndividualDto;
      message?: string;
    }>("/individuals/update", payload);
  }
}

export const customerService = new CustomerService();

