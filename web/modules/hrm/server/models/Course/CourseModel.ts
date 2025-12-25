import { LocaleDataType } from "@base/shared/interface/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";

import { NewHrmTbCourse, hrm_tb_courses } from "../../schemas";

export interface CourseRow {
  id: string;
  code: string;
  name?: unknown;
  description?: unknown;
  category?: string | null;
  duration?: number | null;
  format?: string | null;
  instructor?: string | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface CourseInput {
  code: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
  category?: string | null;
  duration?: number | null;
  format?: string | null;
  instructor?: string | null;
  isActive?: boolean;
}

export default class CourseModel extends BaseModel<typeof hrm_tb_courses> {
  constructor() {
    super(hrm_tb_courses);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;

    return null;
  }

  getCourseById = async (id: string): Promise<CourseRow | null> => {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) return null;

    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      category: row.category ?? undefined,
      duration: row.duration ?? undefined,
      format: row.format ?? undefined,
      instructor: row.instructor ?? undefined,
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: { id: string }): Promise<CourseRow | null> => {
    return this.getCourseById(params.id);
  };

  createCourse = async (payload: CourseInput): Promise<CourseRow> => {
    const now = new Date();
    const insertData: NewHrmTbCourse = {
      code: payload.code,
      name: payload.name,
      description: payload.description
        ? typeof payload.description === "string"
          ? payload.description
          : JSON.stringify(payload.description)
        : null,
      category: payload.category ?? null,
      duration: payload.duration ?? null,
      format: payload.format ?? null,
      instructor: payload.instructor ?? null,
      isActive: payload.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create course");

    const course = await this.getCourseById(created.id);

    if (!course) throw new Error("Failed to load course after creation");

    return course;
  };

  updateCourse = async (
    id: string,
    payload: Partial<CourseInput>,
  ): Promise<CourseRow | null> => {
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
    if (payload.category !== undefined)
      updateData.category = payload.category ?? null;
    if (payload.duration !== undefined)
      updateData.duration = payload.duration ?? null;
    if (payload.format !== undefined)
      updateData.format = payload.format ?? null;
    if (payload.instructor !== undefined)
      updateData.instructor = payload.instructor ?? null;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getCourseById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<CourseInput> = {};

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
    if (payload.category !== undefined) {
      normalizedPayload.category =
        payload.category === null || payload.category === ""
          ? null
          : String(payload.category);
    }
    if (payload.duration !== undefined) {
      normalizedPayload.duration =
        payload.duration === null || payload.duration === ""
          ? null
          : Number(payload.duration);
    }
    if (payload.format !== undefined) {
      normalizedPayload.format =
        payload.format === null || payload.format === ""
          ? null
          : String(payload.format);
    }
    if (payload.instructor !== undefined) {
      normalizedPayload.instructor =
        payload.instructor === null || payload.instructor === ""
          ? null
          : String(payload.instructor);
    }
    if (payload.isActive !== undefined) {
      normalizedPayload.isActive = Boolean(payload.isActive);
    }

    return this.updateCourse(id, normalizedPayload);
  };
}
