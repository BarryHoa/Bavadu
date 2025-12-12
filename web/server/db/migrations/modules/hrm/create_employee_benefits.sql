-- Migration: Create employee_benefits table
-- Tạo bảng employee_benefits

CREATE TABLE "mdl_hrm"."employee_benefits" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"employee_id" uuid NOT NULL,
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
