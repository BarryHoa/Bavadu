import { eq } from "drizzle-orm";

import { LocaleDataType } from "@base/shared/interface/Locale";
import { BaseModel } from "@base/server/models/BaseModel";

import { NewHrmTbWorkflow, hrm_tb_workflows } from "../../schemas";

export interface WorkflowStep {
  step: number;
  name: string;
  approverType: "manager" | "role" | "employee"; // Who can approve
  approverValue?: string; // Role ID or Employee ID
  isRequired: boolean;
  canDelegate: boolean;
}

export interface WorkflowRow {
  id: string;
  code: string;
  name?: unknown;
  description?: unknown;
  workflowType: string;
  steps?: WorkflowStep[];
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface WorkflowInput {
  code: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
  workflowType: string;
  steps: WorkflowStep[];
  isActive?: boolean;
}

export default class WorkflowModel extends BaseModel<typeof hrm_tb_workflows> {
  constructor() {
    super(hrm_tb_workflows);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;

    return null;
  }

  getWorkflowById = async (id: string): Promise<WorkflowRow | null> => {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      workflowType: row.workflowType,
      steps: (row.steps as WorkflowStep[]) ?? [],
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: { id: string }): Promise<WorkflowRow | null> => {
    return this.getWorkflowById(params.id);
  };

  createWorkflow = async (payload: WorkflowInput): Promise<WorkflowRow> => {
    const now = new Date();
    const insertData: NewHrmTbWorkflow = {
      code: payload.code,
      name: payload.name,
      description: payload.description
        ? typeof payload.description === "string"
          ? payload.description
          : JSON.stringify(payload.description)
        : null,
      workflowType: payload.workflowType,
      steps: payload.steps,
      isActive:
        payload.isActive === undefined || payload.isActive === null
          ? true
          : payload.isActive,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) {
      throw new Error("Failed to create workflow");
    }

    const workflow = await this.getWorkflowById(created.id);

    if (!workflow) {
      throw new Error("Failed to load workflow after creation");
    }

    return workflow;
  };

  updateWorkflow = async (
    id: string,
    payload: Partial<WorkflowInput>,
  ): Promise<WorkflowRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.code !== undefined) updateData.code = payload.code;
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.description !== undefined)
      updateData.description = payload.description
        ? typeof payload.description === "string"
          ? payload.description
          : JSON.stringify(payload.description)
        : null;
    if (payload.workflowType !== undefined)
      updateData.workflowType = payload.workflowType;
    if (payload.steps !== undefined) updateData.steps = payload.steps;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getWorkflowById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;

    const normalizedPayload: Partial<WorkflowInput> = {};

    if (payload.code !== undefined) {
      normalizedPayload.code = String(payload.code);
    }
    if (payload.name !== undefined) {
      normalizedPayload.name = this.normalizeLocaleInput(payload.name) ?? {
        en: "",
      };
    }
    if (payload.description !== undefined) {
      normalizedPayload.description = this.normalizeLocaleInput(
        payload.description,
      );
    }
    if (payload.workflowType !== undefined) {
      normalizedPayload.workflowType = String(payload.workflowType);
    }
    if (payload.steps !== undefined) {
      normalizedPayload.steps = Array.isArray(payload.steps)
        ? payload.steps
        : [];
    }
    if (payload.isActive !== undefined) {
      normalizedPayload.isActive = Boolean(payload.isActive);
    }

    return this.updateWorkflow(id, normalizedPayload);
  };
}
