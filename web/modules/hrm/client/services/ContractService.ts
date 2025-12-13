import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export interface ContractDto {
  id: string;
  contractNumber: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  contractType: string;
  startDate: string;
  endDate?: string | null;
  baseSalary: number;
  currency?: string | null;
  workingHours?: number | null;
  probationPeriod?: number | null;
  probationEndDate?: string | null;
  status: string;
  documentUrl?: string | null;
  signedDate?: string | null;
  signedBy?: string | null;
  signedByEmployee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  notes?: string | null;
  metadata?: unknown;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export default class ContractService extends JsonRpcClientService {
  list() {
    return this.call<{
      data: ContractDto[];
      total: number;
      message?: string;
    }>("contract.list.getData", {});
  }

  getById(id: string) {
    return this.call<{
      data: ContractDto;
      message?: string;
    }>("contract.curd.getById", { id });
  }

  create(payload: {
    contractNumber: string;
    employeeId: string;
    contractType: string;
    startDate: string;
    endDate?: string | null;
    baseSalary: number;
    currency?: string | null;
    workingHours?: number | null;
    probationPeriod?: number | null;
    probationEndDate?: string | null;
    status?: string;
    documentUrl?: string | null;
    signedDate?: string | null;
    signedBy?: string | null;
    notes?: string | null;
    metadata?: unknown;
    isActive?: boolean;
  }) {
    return this.call<{
      data: ContractDto;
      message?: string;
    }>("contract.curd.create", payload);
  }

  update(payload: {
    id: string;
    contractNumber?: string;
    employeeId?: string;
    contractType?: string;
    startDate?: string;
    endDate?: string | null;
    baseSalary?: number;
    currency?: string | null;
    workingHours?: number | null;
    probationPeriod?: number | null;
    probationEndDate?: string | null;
    status?: string;
    documentUrl?: string | null;
    signedDate?: string | null;
    signedBy?: string | null;
    notes?: string | null;
    metadata?: unknown;
    isActive?: boolean;
  }) {
    return this.call<{
      data: ContractDto;
      message?: string;
    }>("contract.curd.update", payload);
  }
}

export const contractService = new ContractService();


