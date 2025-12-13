-- Migration: Create payroll_rules table
-- Tạo bảng payroll_rules

CREATE TABLE "mdl_hrm"."payroll_rules" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"description" text,
	"rule_type" varchar(50) NOT NULL,
	"rule_config" jsonb NOT NULL,
	"effective_date" date NOT NULL,
	"expiry_date" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "payroll_rules_code_unique" UNIQUE("code")
);
