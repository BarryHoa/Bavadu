-- Migration: Create employee_benefits table
-- Tạo bảng employee_benefits

CREATE TABLE "mdl_hrm"."employee_benefits" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "md_base"."users"("id") ON DELETE CASCADE,
	"benefit_package_id" uuid NOT NULL,
	"effective_date" date NOT NULL,
	"expiry_date" date,
	"enrollment_date" date,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"life_event_type" varchar(50),
	"notes" varchar(500),
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

CREATE INDEX IF NOT EXISTS "employee_benefits_user_idx" ON "mdl_hrm"."employee_benefits"("user_id");
CREATE INDEX IF NOT EXISTS "employee_benefits_package_idx" ON "mdl_hrm"."employee_benefits"("benefit_package_id");
CREATE INDEX IF NOT EXISTS "employee_benefits_status_idx" ON "mdl_hrm"."employee_benefits"("status");
CREATE INDEX IF NOT EXISTS "employee_benefits_dates_idx" ON "mdl_hrm"."employee_benefits"("effective_date", "expiry_date");
