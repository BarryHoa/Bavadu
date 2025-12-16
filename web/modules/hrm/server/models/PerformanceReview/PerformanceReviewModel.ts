import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  NewHrmTbPerformanceReview,
  hrm_tb_performance_reviews,
} from "../../schemas";
import { hrm_tb_employees } from "../../schemas/hrm.employee";

const employee = alias(hrm_tb_employees, "employee");
const reviewer = alias(hrm_tb_employees, "reviewer");

export interface PerformanceReviewRow {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  reviewType: string;
  reviewPeriod?: string | null;
  reviewDate: string;
  reviewerId: string;
  reviewer?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  overallRating?: number | null;
  strengths?: string | null;
  areasForImprovement?: string | null;
  goals?: unknown;
  feedback?: string | null;
  employeeComments?: string | null;
  status: string;
  completedDate?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface PerformanceReviewInput {
  employeeId: string;
  reviewType: string;
  reviewPeriod?: string | null;
  reviewDate: string;
  reviewerId: string;
  overallRating?: number | null;
  strengths?: string | null;
  areasForImprovement?: string | null;
  goals?: unknown;
  feedback?: string | null;
  employeeComments?: string | null;
  status?: string;
}

export default class PerformanceReviewModel extends BaseModel<
  typeof hrm_tb_performance_reviews
> {
  constructor() {
    super(hrm_tb_performance_reviews);
  }

  getPerformanceReviewById = async (
    id: string,
  ): Promise<PerformanceReviewRow | null> => {
    const result = await this.db
      .select({
        id: this.table.id,
        employeeId: this.table.employeeId,
        employeeCode: employee.employeeCode,
        employeeFullName: employee.fullName,
        reviewType: this.table.reviewType,
        reviewPeriod: this.table.reviewPeriod,
        reviewDate: this.table.reviewDate,
        reviewerId: this.table.reviewerId,
        reviewerCode: reviewer.employeeCode,
        reviewerFullName: reviewer.fullName,
        overallRating: this.table.overallRating,
        strengths: this.table.strengths,
        areasForImprovement: this.table.areasForImprovement,
        goals: this.table.goals,
        feedback: this.table.feedback,
        employeeComments: this.table.employeeComments,
        status: this.table.status,
        completedDate: this.table.completedDate,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
      })
      .from(this.table)
      .leftJoin(employee, eq(this.table.employeeId, employee.id))
      .leftJoin(reviewer, eq(this.table.reviewerId, reviewer.id))
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) return null;

    return {
      id: row.id,
      employeeId: row.employeeId,
      employee: row.employeeId
        ? {
            id: row.employeeId,
            employeeCode: row.employeeCode ?? undefined,
            fullName: row.employeeFullName ?? undefined,
          }
        : null,
      reviewType: row.reviewType,
      reviewPeriod: row.reviewPeriod ?? undefined,
      reviewDate: row.reviewDate,
      reviewerId: row.reviewerId,
      reviewer: row.reviewerId
        ? {
            id: row.reviewerId,
            employeeCode: row.reviewerCode ?? undefined,
            fullName: row.reviewerFullName ?? undefined,
          }
        : null,
      overallRating: row.overallRating ?? undefined,
      strengths: row.strengths ?? undefined,
      areasForImprovement: row.areasForImprovement ?? undefined,
      goals: row.goals,
      feedback: row.feedback ?? undefined,
      employeeComments: row.employeeComments ?? undefined,
      status: row.status,
      completedDate: row.completedDate ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: {
    id: string;
  }): Promise<PerformanceReviewRow | null> => {
    return this.getPerformanceReviewById(params.id);
  };

  createPerformanceReview = async (
    payload: PerformanceReviewInput,
  ): Promise<PerformanceReviewRow> => {
    const now = new Date();
    const insertData: NewHrmTbPerformanceReview = {
      employeeId: payload.employeeId,
      reviewType: payload.reviewType,
      reviewPeriod: payload.reviewPeriod ?? null,
      reviewDate: payload.reviewDate,
      reviewerId: payload.reviewerId,
      overallRating: payload.overallRating ?? null,
      strengths: payload.strengths ?? null,
      areasForImprovement: payload.areasForImprovement ?? null,
      goals: payload.goals ?? null,
      feedback: payload.feedback ?? null,
      employeeComments: payload.employeeComments ?? null,
      status: payload.status ?? "draft",
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create performance review");

    const review = await this.getPerformanceReviewById(created.id);

    if (!review)
      throw new Error("Failed to load performance review after creation");

    return review;
  };

  updatePerformanceReview = async (
    id: string,
    payload: Partial<PerformanceReviewInput>,
  ): Promise<PerformanceReviewRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.employeeId !== undefined)
      updateData.employeeId = payload.employeeId;
    if (payload.reviewType !== undefined)
      updateData.reviewType = payload.reviewType;
    if (payload.reviewPeriod !== undefined)
      updateData.reviewPeriod = payload.reviewPeriod ?? null;
    if (payload.reviewDate !== undefined)
      updateData.reviewDate = payload.reviewDate;
    if (payload.reviewerId !== undefined)
      updateData.reviewerId = payload.reviewerId;
    if (payload.overallRating !== undefined)
      updateData.overallRating = payload.overallRating ?? null;
    if (payload.strengths !== undefined)
      updateData.strengths = payload.strengths ?? null;
    if (payload.areasForImprovement !== undefined)
      updateData.areasForImprovement = payload.areasForImprovement ?? null;
    if (payload.goals !== undefined) updateData.goals = payload.goals ?? null;
    if (payload.feedback !== undefined)
      updateData.feedback = payload.feedback ?? null;
    if (payload.employeeComments !== undefined)
      updateData.employeeComments = payload.employeeComments ?? null;
    if (payload.status !== undefined) {
      updateData.status = payload.status;
      if (payload.status === "completed") {
        updateData.completedDate = new Date().toISOString().split("T")[0];
      }
    }

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getPerformanceReviewById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<PerformanceReviewInput> = {};

    if (payload.employeeId !== undefined) {
      normalizedPayload.employeeId = String(payload.employeeId);
    }
    if (payload.reviewType !== undefined) {
      normalizedPayload.reviewType = String(payload.reviewType);
    }
    if (payload.reviewPeriod !== undefined) {
      normalizedPayload.reviewPeriod =
        payload.reviewPeriod === null || payload.reviewPeriod === ""
          ? null
          : String(payload.reviewPeriod);
    }
    if (payload.reviewDate !== undefined) {
      normalizedPayload.reviewDate = String(payload.reviewDate);
    }
    if (payload.reviewerId !== undefined) {
      normalizedPayload.reviewerId = String(payload.reviewerId);
    }
    if (payload.overallRating !== undefined) {
      normalizedPayload.overallRating =
        payload.overallRating === null || payload.overallRating === ""
          ? null
          : Number(payload.overallRating);
    }
    if (payload.strengths !== undefined) {
      normalizedPayload.strengths =
        payload.strengths === null || payload.strengths === ""
          ? null
          : String(payload.strengths);
    }
    if (payload.areasForImprovement !== undefined) {
      normalizedPayload.areasForImprovement =
        payload.areasForImprovement === null ||
        payload.areasForImprovement === ""
          ? null
          : String(payload.areasForImprovement);
    }
    if (payload.goals !== undefined) {
      normalizedPayload.goals = payload.goals;
    }
    if (payload.feedback !== undefined) {
      normalizedPayload.feedback =
        payload.feedback === null || payload.feedback === ""
          ? null
          : String(payload.feedback);
    }
    if (payload.employeeComments !== undefined) {
      normalizedPayload.employeeComments =
        payload.employeeComments === null || payload.employeeComments === ""
          ? null
          : String(payload.employeeComments);
    }
    if (payload.status !== undefined) {
      normalizedPayload.status = String(payload.status);
    }

    return this.updatePerformanceReview(id, normalizedPayload);
  };
}
