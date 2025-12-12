-- Migration: Create leave_types table
-- Tạo bảng leave_types

CREATE TABLE "mdl_hrm"."leave_types" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"accrual_type" varchar(50) NOT NULL,
	"accrual_rate" integer,
	"max_accrual" integer,
	"carry_forward" boolean DEFAULT false NOT NULL,
	"max_carry_forward" integer,
	"requires_approval" boolean DEFAULT true NOT NULL,
	"is_paid" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "leave_types_code_unique" UNIQUE("code")
);
