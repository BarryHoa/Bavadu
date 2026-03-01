import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export type SequenceRule = {
  id: string;
  code: string;
  name?: string;
  prefix: string;
  suffix?: string;
  description?: string;
  format: string;
  start: number;
  step: number;
  currentValue: number;
  isActive?: boolean;
  countCount?: number;
  counts?: { value: string; createdAt?: number }[];
  createdAt?: number;
  updatedAt?: number;
};

export type CreateSequenceRequest = {
  code: string;
  name?: string;
  prefix?: string;
  suffix?: string;
  description?: string;
  format?: string;
  start?: number;
  step?: number;
};

export type UpdateSequenceRequest = {
  id: string;
  code?: string;
  name?: string;
  prefix?: string;
  suffix?: string;
  description?: string;
  format?: string;
  start?: number;
  step?: number;
  isActive?: boolean;
};

class SequenceService extends JsonRpcClientService {
  async getRule(id: string): Promise<SequenceRule | null> {
    return this.call<SequenceRule | null>("base-sequence.curd.get", { id });
  }

  async createRule(payload: CreateSequenceRequest): Promise<SequenceRule> {
    return this.call<SequenceRule>("base-sequence.curd.create", payload);
  }

  async updateRule(payload: UpdateSequenceRequest): Promise<SequenceRule | null> {
    return this.call<SequenceRule | null>("base-sequence.curd.update", payload);
  }

  async deleteRule(id: string): Promise<{ success: boolean; message: string }> {
    return this.call<{ success: boolean; message: string }>(
      "base-sequence.curd.delete",
      { id },
    );
  }

  /** Lấy giá trị tiếp theo từ sequence theo code (vd: "employee.code") */
  async getNext(code: string): Promise<string> {
    return this.call<string>("base-sequence.curd.getNext", { code });
  }
}

const sequenceService = new SequenceService();

export default sequenceService;
