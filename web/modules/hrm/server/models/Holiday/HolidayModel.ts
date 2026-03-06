import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import dayjs from "dayjs";

import { BaseModel, PermissionRequired } from "@base/server/models/BaseModel";
import { LocaleDataType } from "@base/shared/interface/Locale";

import {
  hrm_tb_holidays,
  NewHrmTbHoliday,
} from "../../schemas/hrm.holiday";

export interface HolidayRow {
  id: string;
  name: unknown;
  date: string;
  year?: number | null;
  isRecurring: boolean;
  holidayType: string;
  countryCode?: string | null;
  isPaid: boolean;
  isActive: boolean;
  description?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface HolidayInput {
  name: LocaleDataType<string>;
  date: string;
  year?: number | null;
  isRecurring?: boolean;
  holidayType?: string;
  countryCode?: string | null;
  isPaid?: boolean;
  isActive?: boolean;
  description?: string | null;
}

export interface HolidayQuery {
  year?: number;
  month?: number;
  countryCode?: string;
  holidayType?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export default class HolidayModel extends BaseModel<typeof hrm_tb_holidays> {
  constructor() {
    super(hrm_tb_holidays);
  }

  private mapRow(row: typeof hrm_tb_holidays.$inferSelect): HolidayRow {
    return {
      id: row.id,
      name: row.name,
      date: row.date,
      year: row.year,
      isRecurring: row.isRecurring,
      holidayType: row.holidayType,
      countryCode: row.countryCode,
      isPaid: row.isPaid,
      isActive: row.isActive,
      description: row.description,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  }

  @PermissionRequired({ auth: true, permissions: ["hrm.holiday.view"] })
  getHolidayById = async (id: string): Promise<HolidayRow | null> => {
    const [row] = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    return row ? this.mapRow(row) : null;
  };

  @PermissionRequired({ auth: true, permissions: ["hrm.holiday.view"] })
  getDataById = async (params: { id: string }): Promise<HolidayRow | null> => {
    return this.getHolidayById(params.id);
  };

  /**
   * Kiểm tra xem ngày đã tồn tại chưa (dùng cho validation).
   */
  @PermissionRequired({ auth: true, permissions: ["hrm.holiday.view"] })
  checkDateExists = async (params: {
    date: string;
    excludeId?: string;
  }): Promise<{ exists: boolean }> => {
    const conditions = [eq(this.table.date, params.date)];

    if (params.excludeId) {
      conditions.push(sql`${this.table.id} != ${params.excludeId}`);
    }

    const [row] = await this.db
      .select({ id: this.table.id })
      .from(this.table)
      .where(and(...conditions))
      .limit(1);

    return { exists: !!row };
  };

  /**
   * Lấy danh sách ngày lễ theo năm và tháng (nếu có).
   * Bao gồm cả recurring holidays (isRecurring = true) và holidays của năm cụ thể.
   */
  @PermissionRequired({ auth: true, permissions: ["hrm.holiday.view"] })
  getHolidaysByMonth = async (
    year: number,
    month: number,
    countryCode: string = "VN",
  ): Promise<HolidayRow[]> => {
    const monthStart = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
    const startDate = monthStart.format("YYYY-MM-DD");
    const endDate = monthStart.endOf("month").format("YYYY-MM-DD");

    const rows = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          gte(this.table.date, startDate),
          lte(this.table.date, endDate),
          eq(this.table.isActive, true),
          eq(this.table.countryCode, countryCode),
          or(eq(this.table.year, year), eq(this.table.isRecurring, true)),
        ),
      )
      .orderBy(this.table.date);

    return rows.map((r) => this.mapRow(r));
  };

  /**
   * Lấy danh sách ngày lễ theo năm (sắp xếp từ mới nhất đến cũ nhất).
   */
  @PermissionRequired({ auth: true, permissions: ["hrm.holiday.view"] })
  getHolidaysByYear = async (params: {
    year: number;
    countryCode?: string;
  }): Promise<{ data: HolidayRow[]; total: number }> => {
    const { year, countryCode = "VN" } = params;
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const rows = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          gte(this.table.date, startDate),
          lte(this.table.date, endDate),
          eq(this.table.countryCode, countryCode),
          or(eq(this.table.year, year), eq(this.table.isRecurring, true)),
        ),
      )
      .orderBy(desc(this.table.date));

    return {
      data: rows.map((r) => this.mapRow(r)),
      total: rows.length,
    };
  };

  /**
   * Lấy danh sách ngày lễ với phân trang.
   */
  @PermissionRequired({ auth: true, permissions: ["hrm.holiday.view"] })
  queryHolidays = async (
    query: HolidayQuery,
  ): Promise<{ holidays: HolidayRow[]; total: number }> => {
    const conditions = [];

    if (query.countryCode) {
      conditions.push(eq(this.table.countryCode, query.countryCode));
    }
    if (query.holidayType) {
      conditions.push(eq(this.table.holidayType, query.holidayType));
    }
    if (query.isActive !== undefined) {
      conditions.push(eq(this.table.isActive, query.isActive));
    }
    if (query.year) {
      const startDate = `${query.year}-01-01`;
      const endDate = `${query.year}-12-31`;
      conditions.push(gte(this.table.date, startDate));
      conditions.push(lte(this.table.date, endDate));
      conditions.push(
        or(eq(this.table.year, query.year), eq(this.table.isRecurring, true)),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(this.table)
        .where(whereClause)
        .orderBy(desc(this.table.date))
        .limit(query.limit ?? 100)
        .offset(query.offset ?? 0),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(this.table)
        .where(whereClause),
    ]);

    return {
      holidays: rows.map((r) => this.mapRow(r)),
      total: totalResult[0]?.count ?? 0,
    };
  };

  @PermissionRequired({ auth: true, permissions: ["hrm.holiday.create"] })
  createHoliday = async (payload: HolidayInput): Promise<HolidayRow> => {
    // Validate: không cho tạo cùng ngày
    const { exists } = await this.checkDateExists({ date: payload.date });
    if (exists) {
      throw new Error(`Holiday already exists for date ${payload.date}`);
    }

    const now = dayjs().toDate();
    const insertData: NewHrmTbHoliday = {
      name: payload.name,
      date: payload.date,
      year: payload.year ?? null,
      isRecurring: payload.isRecurring ?? false,
      holidayType: payload.holidayType ?? "national",
      countryCode: payload.countryCode ?? "VN",
      isPaid: payload.isPaid ?? true,
      isActive: payload.isActive ?? true,
      description: payload.description ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create holiday");

    const holiday = await this.getHolidayById(created.id);
    if (!holiday) throw new Error("Failed to load holiday after creation");

    return holiday;
  };

  @PermissionRequired({ auth: true, permissions: ["hrm.holiday.edit"] })
  updateHoliday = async (
    id: string,
    payload: Partial<Omit<HolidayInput, "date" | "year">>,
  ): Promise<HolidayRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: dayjs().toDate(),
    };

    // Chỉ cho sửa nội dung, không cho sửa date và year
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.isRecurring !== undefined)
      updateData.isRecurring = payload.isRecurring;
    if (payload.holidayType !== undefined)
      updateData.holidayType = payload.holidayType;
    if (payload.countryCode !== undefined)
      updateData.countryCode = payload.countryCode;
    if (payload.isPaid !== undefined) updateData.isPaid = payload.isPaid;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;
    if (payload.description !== undefined)
      updateData.description = payload.description;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getHolidayById(id);
  };

  /**
   * Bulk update (chỉ cho sửa nội dung).
   */
  @PermissionRequired({ auth: true, permissions: ["hrm.holiday.edit"] })
  bulkUpdateHolidays = async (params: {
    ids: string[];
    payload: Partial<Omit<HolidayInput, "date" | "year" | "name">>;
  }): Promise<{ updated: number }> => {
    const { ids, payload } = params;
    if (ids.length === 0) return { updated: 0 };

    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: dayjs().toDate(),
    };

    if (payload.isRecurring !== undefined)
      updateData.isRecurring = payload.isRecurring;
    if (payload.holidayType !== undefined)
      updateData.holidayType = payload.holidayType;
    if (payload.countryCode !== undefined)
      updateData.countryCode = payload.countryCode;
    if (payload.isPaid !== undefined) updateData.isPaid = payload.isPaid;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;
    if (payload.description !== undefined)
      updateData.description = payload.description;

    const result = await this.db
      .update(this.table)
      .set(updateData)
      .where(sql`${this.table.id} = ANY(${ids})`)
      .returning({ id: this.table.id });

    return { updated: result.length };
  };

  @PermissionRequired({ auth: true, permissions: ["hrm.holiday.delete"] })
  deleteHoliday = async (id: string): Promise<{ success: boolean }> => {
    const result = await this.db
      .delete(this.table)
      .where(eq(this.table.id, id))
      .returning({ id: this.table.id });

    return { success: result.length > 0 };
  };

  /**
   * Bulk delete.
   */
  @PermissionRequired({ auth: true, permissions: ["hrm.holiday.delete"] })
  bulkDeleteHolidays = async (params: {
    ids: string[];
  }): Promise<{ deleted: number }> => {
    const { ids } = params;
    if (ids.length === 0) return { deleted: 0 };

    const result = await this.db
      .delete(this.table)
      .where(sql`${this.table.id} = ANY(${ids})`)
      .returning({ id: this.table.id });

    return { deleted: result.length };
  };

  /**
   * API cho RPC: Lấy danh sách ngày lễ theo tháng (dùng cho tính ngày công).
   */
  @PermissionRequired({ auth: true })
  getHolidaysForWorkingDays = async (params: {
    year: number;
    month: number;
    countryCode?: string;
  }): Promise<{ data: string[] }> => {
    const holidays = await this.getHolidaysByMonth(
      params.year,
      params.month,
      params.countryCode ?? "VN",
    );

    return {
      data: holidays.map((h) => h.date),
    };
  };

  /**
   * API cho RPC: Lấy danh sách ngày lễ theo tháng với đầy đủ thông tin.
   */
  @PermissionRequired({ auth: true })
  getHolidaysWithDetailsByMonth = async (params: {
    year: number;
    month: number;
    countryCode?: string;
  }): Promise<HolidayRow[]> => {
    return this.getHolidaysByMonth(
      params.year,
      params.month,
      params.countryCode ?? "VN",
    );
  };
}
