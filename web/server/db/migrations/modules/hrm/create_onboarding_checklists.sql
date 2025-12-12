-- Migration: Create onboarding_checklists table
-- Tạo bảng onboarding_checklists

CREATE TABLE "mdl_hrm"."onboarding_checklists" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"employee_id" uuid NOT NULL,
	"task_name" jsonb NOT NULL,
	"task_description" jsonb,
	"category" varchar(50),
	"assigned_to" uuid,
	"due_date" date,
	"completed_date" date,
	"is_completed" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
