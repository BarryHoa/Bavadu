-- Migration: Create employee_trainings table
-- Tạo bảng employee_trainings

CREATE TABLE "mdl_hrm"."employee_trainings" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"employee_id" uuid NOT NULL,
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
