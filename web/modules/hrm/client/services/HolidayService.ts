import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export interface HolidayDto {
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

export interface CreateHolidayPayload {
  name: { vi: string; en?: string };
  date: string;
  year?: number | null;
  isRecurring?: boolean;
  holidayType?: string;
  countryCode?: string;
  isPaid?: boolean;
  isActive?: boolean;
  description?: string | null;
}

export interface UpdateHolidayPayload {
  name?: { vi: string; en?: string };
  isRecurring?: boolean;
  holidayType?: string;
  countryCode?: string;
  isPaid?: boolean;
  isActive?: boolean;
  description?: string | null;
}

export default class HolidayService extends JsonRpcClientService {
  /**
   * Lấy danh sách ngày lễ theo năm.
   */
  getByYear(year: number, countryCode?: string) {
    return this.call<{
      data: HolidayDto[];
      total: number;
    }>("holiday.curd.getHolidaysByYear", {
      year,
      countryCode: countryCode ?? "VN",
    });
  }

  /**
   * Lấy danh sách ngày lễ theo tháng (dùng cho tính ngày công).
   * Trả về mảng các ngày (YYYY-MM-DD).
   */
  getHolidaysForWorkingDays(params: {
    year: number;
    month: number;
    countryCode?: string;
  }) {
    return this.call<{
      data: string[];
    }>("holiday.curd.getHolidaysForWorkingDays", params);
  }

  /**
   * Lấy danh sách ngày lễ theo tháng với đầy đủ thông tin.
   */
  getByMonth(year: number, month: number, countryCode?: string) {
    return this.call<HolidayDto[]>("holiday.curd.getHolidaysWithDetailsByMonth", {
      year,
      month,
      countryCode: countryCode ?? "VN",
    });
  }

  /**
   * Kiểm tra ngày đã tồn tại chưa.
   */
  checkDateExists(date: string, excludeId?: string) {
    return this.call<{ exists: boolean }>("holiday.curd.checkDateExists", {
      date,
      excludeId,
    });
  }

  /**
   * Lấy thông tin ngày lễ theo ID.
   */
  getById(id: string) {
    return this.call<HolidayDto>("holiday.curd.getDataById", { id });
  }

  /**
   * Tạo ngày lễ mới.
   */
  create(payload: CreateHolidayPayload) {
    return this.call<HolidayDto>("holiday.curd.createHoliday", payload);
  }

  /**
   * Cập nhật ngày lễ (chỉ sửa nội dung, không sửa date/year).
   */
  update(id: string, payload: UpdateHolidayPayload) {
    return this.call<HolidayDto>("holiday.curd.updateHoliday", { id, ...payload });
  }

  /**
   * Xóa ngày lễ.
   */
  deleteHoliday(id: string) {
    return this.call<{ success: boolean }>("holiday.curd.deleteHoliday", { id });
  }

  /**
   * Bulk delete.
   */
  bulkDelete(ids: string[]) {
    return this.call<{ deleted: number }>("holiday.curd.bulkDeleteHolidays", {
      ids,
    });
  }

  /**
   * Bulk update (chỉ sửa nội dung).
   */
  bulkUpdate(ids: string[], payload: UpdateHolidayPayload) {
    return this.call<{ updated: number }>("holiday.curd.bulkUpdateHolidays", {
      ids,
      payload,
    });
  }
}

export const holidayService = new HolidayService();
