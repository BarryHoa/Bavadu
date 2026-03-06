-- Migration: Create employee_trainings table
-- Tạo bảng employee_trainings

CREATE TABLE "mdl_hrm"."employee_trainings" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "md_base"."users"("id") ON DELETE CASCADE,
	"course_id" uuid NOT NULL,
	"enrollment_date" date NOT NULL,
	"completion_date" date,
	"status" varchar(50) DEFAULT 'enrolled' NOT NULL,
	"score" integer,
	"certificate_url" varchar(500),
	"notes" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

CREATE INDEX IF NOT EXISTS "employee_trainings_user_idx" ON "mdl_hrm"."employee_trainings"("user_id");
CREATE INDEX IF NOT EXISTS "employee_trainings_course_idx" ON "mdl_hrm"."employee_trainings"("course_id");
CREATE INDEX IF NOT EXISTS "employee_trainings_status_idx" ON "mdl_hrm"."employee_trainings"("status");
