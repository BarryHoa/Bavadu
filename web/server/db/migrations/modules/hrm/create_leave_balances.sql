-- Migration: Create leave_balances table
-- Tạo bảng leave_balances

CREATE TABLE "mdl_hrm"."leave_balances" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "md_base"."users"("id") ON DELETE CASCADE,
	"leave_type_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"accrued" integer DEFAULT 0 NOT NULL,
	"used" integer DEFAULT 0 NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"carried_forward" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "leave_balances_user_idx" ON "mdl_hrm"."leave_balances"("user_id");
CREATE INDEX IF NOT EXISTS "leave_balances_type_idx" ON "mdl_hrm"."leave_balances"("leave_type_id");
CREATE INDEX IF NOT EXISTS "leave_balances_year_idx" ON "mdl_hrm"."leave_balances"("year");
CREATE INDEX IF NOT EXISTS "leave_balances_user_type_year_idx" ON "mdl_hrm"."leave_balances"("user_id", "leave_type_id", "year");
