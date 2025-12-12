-- Migration: Create employee_history table
-- Tạo bảng employee_history

CREATE TABLE "mdl_hrm"."employee_history" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"employee_id" uuid NOT NULL,
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
