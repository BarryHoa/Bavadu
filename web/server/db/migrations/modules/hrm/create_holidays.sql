-- Migration: Create holidays table (HRM - quản lý ngày lễ)
-- Tạo bảng holidays

CREATE TABLE IF NOT EXISTS "mdl_hrm"."holidays" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" jsonb NOT NULL,
	"date" date NOT NULL,
	"year" integer,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"holiday_type" varchar(50) DEFAULT 'national' NOT NULL,
	"country_code" varchar(10) DEFAULT 'VN',
	"is_paid" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" varchar(500),
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

CREATE INDEX IF NOT EXISTS "hrm_holidays_date_idx" ON "mdl_hrm"."holidays"("date");
CREATE INDEX IF NOT EXISTS "hrm_holidays_year_idx" ON "mdl_hrm"."holidays"("year");
CREATE INDEX IF NOT EXISTS "hrm_holidays_type_idx" ON "mdl_hrm"."holidays"("holiday_type");
CREATE INDEX IF NOT EXISTS "hrm_holidays_country_idx" ON "mdl_hrm"."holidays"("country_code");
CREATE INDEX IF NOT EXISTS "hrm_holidays_active_idx" ON "mdl_hrm"."holidays"("is_active");
