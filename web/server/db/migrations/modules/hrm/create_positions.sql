-- Migration: Create positions table
-- Tạo bảng positions

CREATE TABLE "mdl_hrm"."positions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"department_id" uuid NOT NULL,
	"job_family" varchar(100),
	"job_grade" varchar(50),
	"reports_to" uuid,
	"min_salary" integer,
	"max_salary" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "positions_code_unique" UNIQUE("code")
);
