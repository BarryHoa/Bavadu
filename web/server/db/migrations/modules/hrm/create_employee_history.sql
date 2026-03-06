-- Migration: Create employee_history table
-- Tạo bảng employee_history

CREATE TABLE "mdl_hrm"."employee_history" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "md_base"."users"("id") ON DELETE CASCADE,
	"change_type" varchar(50) NOT NULL,
	"effective_date" date NOT NULL,
	"previous_value" jsonb,
	"new_value" jsonb,
	"reason" text,
	"approved_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone,
	"created_by" varchar(36)
);

CREATE INDEX IF NOT EXISTS "employee_history_user_idx" ON "mdl_hrm"."employee_history"("user_id");
CREATE INDEX IF NOT EXISTS "employee_history_type_idx" ON "mdl_hrm"."employee_history"("change_type");
CREATE INDEX IF NOT EXISTS "employee_history_date_idx" ON "mdl_hrm"."employee_history"("effective_date");
