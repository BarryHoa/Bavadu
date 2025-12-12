-- Migration: Create payrolls table
-- Tạo bảng payrolls

CREATE TABLE "mdl_hrm"."payrolls" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"payroll_period_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"base_salary" integer NOT NULL,
	"allowances" jsonb,
	"overtime_pay" integer DEFAULT 0,
	"bonuses" integer DEFAULT 0,
	"other_earnings" integer DEFAULT 0,
	"gross_salary" integer NOT NULL,
	"social_insurance" integer DEFAULT 0,
	"health_insurance" integer DEFAULT 0,
	"unemployment_insurance" integer DEFAULT 0,
	"personal_income_tax" integer DEFAULT 0,
	"other_deductions" jsonb,
	"total_deductions" integer DEFAULT 0,
	"net_salary" integer NOT NULL,
	"working_days" integer DEFAULT 0,
	"working_hours" integer DEFAULT 0,
	"overtime_hours" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" varchar(1000),
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
