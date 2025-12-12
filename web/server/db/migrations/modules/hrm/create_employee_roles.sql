-- Migration: Create employee_roles table
-- Tạo bảng employee_roles

CREATE TABLE "mdl_hrm"."employee_roles" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"employee_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"department_id" uuid,
	"location_id" uuid,
	"effective_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"created_at" timestamp with time zone,
	"created_by" varchar(36)
);
