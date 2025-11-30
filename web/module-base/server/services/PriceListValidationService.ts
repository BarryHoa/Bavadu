import { and, eq, gte, lte, or, sql } from "drizzle-orm";
import getDbConnect from "../utils/getDbConnect";
import {
  table_price_lists_b2c,
  TblPriceListB2C,
  NewTblPriceListB2C,
} from "../schemas/price-list-b2c";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ApplicableTo {
  channels?: string[];
  stores?: string[];
  locations?: string[];
  regions?: string[];
  customerGroups?: string[];
}

/**
 * Service để validate các rules của B2C Price Lists
 */
export class PriceListValidationService {
  private db = getDbConnect();

  /**
   * Validate tất cả rules trước khi tạo/cập nhật price list
   */
  async validatePriceList(
    data: NewTblPriceListB2C | TblPriceListB2C,
    existingId?: string
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    // 1. Validate validFrom và validTo
    if (!data.validFrom) {
      errors.push("validFrom là bắt buộc");
    }

    if (data.validTo && data.validFrom && data.validTo < data.validFrom) {
      errors.push("validTo phải >= validFrom");
    }

    if (data.type !== "standard" && !data.validTo) {
      errors.push(
        "Nếu type != 'standard' thì validTo là bắt buộc (không được NULL)"
      );
    }

    // 2. Validate applicableTo
    if (!data.applicableTo) {
      errors.push("applicableTo là bắt buộc");
    } else {
      const applicableTo = data.applicableTo as ApplicableTo;
      // Kiểm tra cấu trúc
      if (
        !applicableTo.channels &&
        !applicableTo.stores &&
        !applicableTo.locations &&
        !applicableTo.regions &&
        !applicableTo.customerGroups
      ) {
        errors.push(
          "applicableTo phải có ít nhất một trong: channels, stores, locations, regions, customerGroups"
        );
      }
    }

    // 3. Validate không trùng valid dates cho standard price lists
    if (data.type === "standard" && data.status === "active") {
      const overlapError = await this.checkStandardPriceListOverlap(
        data,
        existingId
      );
      if (overlapError) {
        errors.push(overlapError);
      }
    }

    // 4. Validate ít nhất 1 standard price list active (chỉ khi update/delete)
    if (existingId) {
      const activeStandardError = await this.checkAtLeastOneActiveStandard(
        data,
        existingId
      );
      if (activeStandardError) {
        errors.push(activeStandardError);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Kiểm tra không trùng valid dates cho standard price lists với cùng applicableTo
   */
  private async checkStandardPriceListOverlap(
    data: NewTblPriceListB2C | TblPriceListB2C,
    existingId?: string
  ): Promise<string | null> {
    if (!data.applicableTo || !data.validFrom) {
      return null; // Đã validate ở trên
    }

    const applicableTo = data.applicableTo as ApplicableTo;

    // Tìm các standard price lists khác với cùng applicableTo
    const existing = await this.db
      .select()
      .from(table_price_lists_b2c)
      .where(
        and(
          eq(table_price_lists_b2c.type, "standard"),
          eq(table_price_lists_b2c.status, "active"),
          sql`${table_price_lists_b2c.applicableTo} = ${JSON.stringify(applicableTo)}::jsonb`,
          existingId
            ? sql`${table_price_lists_b2c.id} != ${existingId}::uuid`
            : sql`1=1`
        )
      );

    for (const existingList of existing) {
      const existingValidFrom = existingList.validFrom;
      const existingValidTo = existingList.validTo;
      const newValidFrom = data.validFrom;
      const newValidTo = data.validTo;

      // Trường hợp 1: Record mới có validTo = NULL (mãi mãi)
      if (!newValidTo) {
        return `Không được phép tạo bảng giá standard mãi mãi khi đã có bảng giá standard khác với cùng applicableTo`;
      }

      // Trường hợp 2: Record cũ có validTo = NULL (mãi mãi)
      if (!existingValidTo) {
        return `Không được phép tạo bảng giá standard khi đã có bảng giá standard mãi mãi với cùng applicableTo`;
      }

      // Trường hợp 3: Có overlap về thời gian
      const hasOverlap =
        // Record mới bắt đầu trong khoảng thời gian của record cũ
        (newValidFrom >= existingValidFrom &&
          newValidFrom <= existingValidTo) ||
        // Record mới kết thúc trong khoảng thời gian của record cũ
        (newValidTo >= existingValidFrom &&
          newValidTo <= existingValidTo) ||
        // Record cũ nằm hoàn toàn trong record mới
        (existingValidFrom >= newValidFrom &&
          existingValidTo <= newValidTo);

      if (hasOverlap) {
        return `Không được phép tạo bảng giá standard với cùng applicableTo và trùng thời gian áp dụng. Vui lòng kiểm tra valid_from và valid_to.`;
      }
    }

    return null;
  }

  /**
   * Kiểm tra ít nhất 1 standard price list đang active
   */
  private async checkAtLeastOneActiveStandard(
    data: NewTblPriceListB2C | TblPriceListB2C,
    existingId: string
  ): Promise<string | null> {
    // Lấy record hiện tại
    const existing = await this.db
      .select()
      .from(table_price_lists_b2c)
      .where(eq(table_price_lists_b2c.id, existingId))
      .limit(1);

    if (existing.length === 0) {
      return null; // Record không tồn tại
    }

    const existingRecord = existing[0];

    // Chỉ kiểm tra nếu đang xóa hoặc deactivate một standard price list
    const isDeactivatingStandard =
      existingRecord.type === "standard" &&
      existingRecord.status === "active" &&
      (data.status !== "active" || data.type !== "standard");

    if (!isDeactivatingStandard) {
      return null; // Không phải trường hợp cần kiểm tra
    }

    // Đếm số standard price list còn lại đang active
    const activeStandardCount = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(table_price_lists_b2c)
      .where(
        and(
          eq(table_price_lists_b2c.type, "standard"),
          eq(table_price_lists_b2c.status, "active"),
          sql`${table_price_lists_b2c.id} != ${existingId}::uuid`
        )
      );

    const count = Number(activeStandardCount[0]?.count || 0);

    if (count === 0) {
      return "Hệ thống bắt buộc phải có ít nhất 1 bảng giá standard đang active.";
    }

    return null;
  }

  /**
   * Kiểm tra xem có ít nhất 1 standard price list đang active không
   */
  async hasActiveStandardPriceList(): Promise<boolean> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(table_price_lists_b2c)
      .where(
        and(
          eq(table_price_lists_b2c.type, "standard"),
          eq(table_price_lists_b2c.status, "active")
        )
      );

    const count = Number(result[0]?.count || 0);
    return count > 0;
  }
}

