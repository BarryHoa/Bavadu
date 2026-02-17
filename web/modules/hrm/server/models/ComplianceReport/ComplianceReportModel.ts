import { eq } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";

import {
  NewHrmTbComplianceReport,
  hrm_tb_compliance_reports,
} from "../../schemas";

export interface ComplianceReportRow {
  id: string;
  reportNumber: string;
  reportType: string;
  reportingPeriod: string;
  reportDate: string;
  submittedDate?: string | null;
  status: string;
  fileUrl?: string | null;
  data?: unknown;
  notes?: string | null;
  approvedBy?: string | null;
  approvedAt?: number | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface ComplianceReportInput {
  reportNumber: string;
  reportType: string;
  reportingPeriod: string;
  reportDate: string;
  submittedDate?: string | null;
  status?: string;
  fileUrl?: string | null;
  data?: unknown;
  notes?: string | null;
}

export default class ComplianceReportModel extends BaseModel<
  typeof hrm_tb_compliance_reports
> {
  constructor() {
    super(hrm_tb_compliance_reports);
  }

  getComplianceReportById = async (
    id: string,
  ): Promise<ComplianceReportRow | null> => {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) return null;

    return {
      id: row.id,
      reportNumber: row.reportNumber,
      reportType: row.reportType,
      reportingPeriod: row.reportingPeriod,
      reportDate: row.reportDate,
      submittedDate: row.submittedDate ?? undefined,
      status: row.status,
      fileUrl: row.fileUrl ?? undefined,
      data: row.data,
      notes: row.notes ?? undefined,
      approvedBy: row.approvedBy ?? undefined,
      approvedAt: row.approvedAt?.getTime(),
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: {
    id: string;
  }): Promise<ComplianceReportRow | null> => {
    return this.getComplianceReportById(params.id);
  };

  createComplianceReport = async (
    payload: ComplianceReportInput,
  ): Promise<ComplianceReportRow> => {
    const now = new Date();
    const insertData: NewHrmTbComplianceReport = {
      reportNumber: payload.reportNumber,
      reportType: payload.reportType,
      reportingPeriod: payload.reportingPeriod,
      reportDate: payload.reportDate,
      submittedDate: payload.submittedDate ?? null,
      status: payload.status ?? "draft",
      fileUrl: payload.fileUrl ?? null,
      data: payload.data ?? null,
      notes: payload.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create compliance report");

    const report = await this.getComplianceReportById(created.id);

    if (!report)
      throw new Error("Failed to load compliance report after creation");

    return report;
  };

  updateComplianceReport = async (
    id: string,
    payload: Partial<ComplianceReportInput>,
  ): Promise<ComplianceReportRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.reportNumber !== undefined)
      updateData.reportNumber = payload.reportNumber;
    if (payload.reportType !== undefined)
      updateData.reportType = payload.reportType;
    if (payload.reportingPeriod !== undefined)
      updateData.reportingPeriod = payload.reportingPeriod;
    if (payload.reportDate !== undefined)
      updateData.reportDate = payload.reportDate;
    if (payload.submittedDate !== undefined)
      updateData.submittedDate = payload.submittedDate ?? null;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.fileUrl !== undefined)
      updateData.fileUrl = payload.fileUrl ?? null;
    if (payload.data !== undefined) updateData.data = payload.data ?? null;
    if (payload.notes !== undefined) updateData.notes = payload.notes ?? null;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getComplianceReportById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<ComplianceReportInput> = {};

    if (payload.reportNumber !== undefined) {
      normalizedPayload.reportNumber = String(payload.reportNumber);
    }
    if (payload.reportType !== undefined) {
      normalizedPayload.reportType = String(payload.reportType);
    }
    if (payload.reportingPeriod !== undefined) {
      normalizedPayload.reportingPeriod = String(payload.reportingPeriod);
    }
    if (payload.reportDate !== undefined) {
      normalizedPayload.reportDate = String(payload.reportDate);
    }
    if (payload.submittedDate !== undefined) {
      normalizedPayload.submittedDate =
        payload.submittedDate === null || payload.submittedDate === ""
          ? null
          : String(payload.submittedDate);
    }
    if (payload.status !== undefined) {
      normalizedPayload.status = String(payload.status);
    }
    if (payload.fileUrl !== undefined) {
      normalizedPayload.fileUrl =
        payload.fileUrl === null || payload.fileUrl === ""
          ? null
          : String(payload.fileUrl);
    }
    if (payload.data !== undefined) {
      normalizedPayload.data = payload.data;
    }
    if (payload.notes !== undefined) {
      normalizedPayload.notes =
        payload.notes === null || payload.notes === ""
          ? null
          : String(payload.notes);
    }

    return this.updateComplianceReport(id, normalizedPayload);
  };
}
