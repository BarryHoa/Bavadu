import { LocaleDataType } from "@base/server/interfaces/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { NewTblJobRequisition, table_job_requisition } from "../../schemas";
import { table_department } from "../../schemas/department";
import { table_position } from "../../schemas/position";

const department = alias(table_department, "department");
const position = alias(table_position, "position");

export interface JobRequisitionRow {
  id: string;
  requisitionNumber: string;
  title?: unknown;
  description?: unknown;
  departmentId: string;
  department?: {
    id: string;
    name?: unknown;
  } | null;
  positionId: string;
  position?: {
    id: string;
    name?: unknown;
  } | null;
  numberOfOpenings: number;
  priority?: string | null;
  employmentType?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;
  requirements?: string | null;
  status: string;
  openedDate?: string | null;
  closedDate?: string | null;
  hiringManagerId?: string | null;
  recruiterId?: string | null;
  notes?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface JobRequisitionInput {
  requisitionNumber: string;
  title: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
  departmentId: string;
  positionId: string;
  numberOfOpenings?: number;
  priority?: string | null;
  employmentType?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;
  requirements?: string | null;
  status?: string;
  openedDate?: string | null;
  closedDate?: string | null;
  hiringManagerId?: string | null;
  recruiterId?: string | null;
  notes?: string | null;
}

export default class JobRequisitionModel extends BaseModel<
  typeof table_job_requisition
> {
  constructor() {
    super(table_job_requisition);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;
    return null;
  }

  getJobRequisitionById = async (
    id: string
  ): Promise<JobRequisitionRow | null> => {
    const result = await this.db
      .select({
        id: this.table.id,
        requisitionNumber: this.table.requisitionNumber,
        title: this.table.title,
        description: this.table.description,
        departmentId: this.table.departmentId,
        departmentName: department.name,
        positionId: this.table.positionId,
        positionName: position.name,
        numberOfOpenings: this.table.numberOfOpenings,
        priority: this.table.priority,
        employmentType: this.table.employmentType,
        minSalary: this.table.minSalary,
        maxSalary: this.table.maxSalary,
        currency: this.table.currency,
        requirements: this.table.requirements,
        status: this.table.status,
        openedDate: this.table.openedDate,
        closedDate: this.table.closedDate,
        hiringManagerId: this.table.hiringManagerId,
        recruiterId: this.table.recruiterId,
        notes: this.table.notes,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
      })
      .from(this.table)
      .leftJoin(department, eq(this.table.departmentId, department.id))
      .leftJoin(position, eq(this.table.positionId, position.id))
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];
    if (!row) return null;

    return {
      id: row.id,
      requisitionNumber: row.requisitionNumber,
      title: row.title,
      description: row.description,
      departmentId: row.departmentId,
      department: row.departmentId
        ? {
            id: row.departmentId,
            name: row.departmentName ?? undefined,
          }
        : null,
      positionId: row.positionId,
      position: row.positionId
        ? {
            id: row.positionId,
            name: row.positionName ?? undefined,
          }
        : null,
      numberOfOpenings: row.numberOfOpenings,
      priority: row.priority ?? undefined,
      employmentType: row.employmentType ?? undefined,
      minSalary: row.minSalary ?? undefined,
      maxSalary: row.maxSalary ?? undefined,
      currency: row.currency ?? undefined,
      requirements: row.requirements ?? undefined,
      status: row.status,
      openedDate: row.openedDate ?? undefined,
      closedDate: row.closedDate ?? undefined,
      hiringManagerId: row.hiringManagerId ?? undefined,
      recruiterId: row.recruiterId ?? undefined,
      notes: row.notes ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: {
    id: string;
  }): Promise<JobRequisitionRow | null> => {
    return this.getJobRequisitionById(params.id);
  };

  createJobRequisition = async (
    payload: JobRequisitionInput
  ): Promise<JobRequisitionRow> => {
    const now = new Date();
    const insertData: NewTblJobRequisition = {
      requisitionNumber: payload.requisitionNumber,
      title: payload.title,
      description: payload.description ?? null,
      departmentId: payload.departmentId,
      positionId: payload.positionId,
      numberOfOpenings: payload.numberOfOpenings ?? 1,
      priority: payload.priority ?? "normal",
      employmentType: payload.employmentType ?? null,
      minSalary: payload.minSalary ?? null,
      maxSalary: payload.maxSalary ?? null,
      currency: payload.currency ?? "VND",
      requirements: payload.requirements ?? null,
      status: payload.status ?? "draft",
      openedDate: payload.openedDate ?? null,
      closedDate: payload.closedDate ?? null,
      hiringManagerId: payload.hiringManagerId ?? null,
      recruiterId: payload.recruiterId ?? null,
      notes: payload.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create job requisition");

    const requisition = await this.getJobRequisitionById(created.id);
    if (!requisition)
      throw new Error("Failed to load job requisition after creation");
    return requisition;
  };

  updateJobRequisition = async (
    id: string,
    payload: Partial<JobRequisitionInput>
  ): Promise<JobRequisitionRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.requisitionNumber !== undefined)
      updateData.requisitionNumber = payload.requisitionNumber;
    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.description !== undefined)
      updateData.description = payload.description ?? null;
    if (payload.departmentId !== undefined)
      updateData.departmentId = payload.departmentId;
    if (payload.positionId !== undefined)
      updateData.positionId = payload.positionId;
    if (payload.numberOfOpenings !== undefined)
      updateData.numberOfOpenings = payload.numberOfOpenings;
    if (payload.priority !== undefined)
      updateData.priority = payload.priority ?? null;
    if (payload.employmentType !== undefined)
      updateData.employmentType = payload.employmentType ?? null;
    if (payload.minSalary !== undefined)
      updateData.minSalary = payload.minSalary ?? null;
    if (payload.maxSalary !== undefined)
      updateData.maxSalary = payload.maxSalary ?? null;
    if (payload.currency !== undefined)
      updateData.currency = payload.currency ?? null;
    if (payload.requirements !== undefined)
      updateData.requirements = payload.requirements ?? null;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.openedDate !== undefined)
      updateData.openedDate = payload.openedDate ?? null;
    if (payload.closedDate !== undefined)
      updateData.closedDate = payload.closedDate ?? null;
    if (payload.hiringManagerId !== undefined)
      updateData.hiringManagerId = payload.hiringManagerId ?? null;
    if (payload.recruiterId !== undefined)
      updateData.recruiterId = payload.recruiterId ?? null;
    if (payload.notes !== undefined) updateData.notes = payload.notes ?? null;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));
    return this.getJobRequisitionById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<JobRequisitionInput> = {};

    if (payload.requisitionNumber !== undefined) {
      normalizedPayload.requisitionNumber = String(payload.requisitionNumber);
    }
    if (payload.title !== undefined) {
      normalizedPayload.title = this.normalizeLocaleInput(payload.title) ?? {
        en: "",
      };
    }
    if (payload.description !== undefined) {
      normalizedPayload.description = this.normalizeLocaleInput(
        payload.description
      );
    }
    if (payload.departmentId !== undefined) {
      normalizedPayload.departmentId = String(payload.departmentId);
    }
    if (payload.positionId !== undefined) {
      normalizedPayload.positionId = String(payload.positionId);
    }
    if (payload.numberOfOpenings !== undefined) {
      normalizedPayload.numberOfOpenings = Number(payload.numberOfOpenings);
    }
    if (payload.priority !== undefined) {
      normalizedPayload.priority =
        payload.priority === null || payload.priority === ""
          ? null
          : String(payload.priority);
    }
    if (payload.employmentType !== undefined) {
      normalizedPayload.employmentType =
        payload.employmentType === null || payload.employmentType === ""
          ? null
          : String(payload.employmentType);
    }
    if (payload.minSalary !== undefined) {
      normalizedPayload.minSalary =
        payload.minSalary === null || payload.minSalary === ""
          ? null
          : Number(payload.minSalary);
    }
    if (payload.maxSalary !== undefined) {
      normalizedPayload.maxSalary =
        payload.maxSalary === null || payload.maxSalary === ""
          ? null
          : Number(payload.maxSalary);
    }
    if (payload.currency !== undefined) {
      normalizedPayload.currency =
        payload.currency === null || payload.currency === "" ? null : String(payload.currency);
    }
    if (payload.requirements !== undefined) {
      normalizedPayload.requirements =
        payload.requirements === null || payload.requirements === ""
          ? null
          : String(payload.requirements);
    }
    if (payload.status !== undefined) {
      normalizedPayload.status = String(payload.status);
    }
    if (payload.openedDate !== undefined) {
      normalizedPayload.openedDate =
        payload.openedDate === null || payload.openedDate === ""
          ? null
          : String(payload.openedDate);
    }
    if (payload.closedDate !== undefined) {
      normalizedPayload.closedDate =
        payload.closedDate === null || payload.closedDate === ""
          ? null
          : String(payload.closedDate);
    }
    if (payload.hiringManagerId !== undefined) {
      normalizedPayload.hiringManagerId =
        payload.hiringManagerId === null || payload.hiringManagerId === ""
          ? null
          : String(payload.hiringManagerId);
    }
    if (payload.recruiterId !== undefined) {
      normalizedPayload.recruiterId =
        payload.recruiterId === null || payload.recruiterId === ""
          ? null
          : String(payload.recruiterId);
    }
    if (payload.notes !== undefined) {
      normalizedPayload.notes =
        payload.notes === null || payload.notes === "" ? null : String(payload.notes);
    }

    return this.updateJobRequisition(id, normalizedPayload);
  };
}

