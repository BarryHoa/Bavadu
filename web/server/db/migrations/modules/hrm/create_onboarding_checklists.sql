-- Migration: Create onboarding_checklists table
-- Tạo bảng onboarding_checklists

CREATE TABLE "mdl_hrm"."onboarding_checklists" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "md_base"."users"("id") ON DELETE CASCADE,
	"task_name" jsonb NOT NULL,
	"task_description" text,
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

-- Add indexes
CREATE INDEX IF NOT EXISTS "onboarding_checklists_user_idx" ON "mdl_hrm"."onboarding_checklists"("user_id");
CREATE INDEX IF NOT EXISTS "onboarding_checklists_assigned_idx" ON "mdl_hrm"."onboarding_checklists"("assigned_to");
CREATE INDEX IF NOT EXISTS "onboarding_checklists_completed_idx" ON "mdl_hrm"."onboarding_checklists"("is_completed");
