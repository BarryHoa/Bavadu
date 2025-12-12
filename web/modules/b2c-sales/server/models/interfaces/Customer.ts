import type { LocaleDataType } from "@base/server/interfaces/Locale";
import type { User } from "@base/server/interfaces/User";
import type {
  SaleB2cTbCustomerCompany,
  SaleB2cTbCustomer,
} from "../../schemas";

export interface CustomerCompany extends SaleB2cTbCustomerCompany {
  createdByUser?: User;
  updatedByUser?: User;
}

export interface CustomerIndividual extends SaleB2cTbCustomer {
  createdByUser?: User;
  updatedByUser?: User;
}

export interface CreateCustomerCompanyInput {
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
}

export interface UpdateCustomerCompanyInput extends Partial<CreateCustomerCompanyInput> {
  id: string;
}

export interface CreateCustomerIndividualInput {
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
}

export interface UpdateCustomerIndividualInput extends Partial<CreateCustomerIndividualInput> {
  id: string;
}

