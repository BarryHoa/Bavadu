-- Migration: Create onboarding_checklists table
-- Tạo bảng onboarding_checklists

CREATE TABLE "mdl_hrm"."onboarding_checklists" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"employee_id" uuid NOT NULL,
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

-- Add foreign key constraint
ALTER TABLE "mdl_hrm"."onboarding_checklists"
	ADD CONSTRAINT "onboarding_checklists_employee_id_employees_id_fk"
	FOREIGN KEY ("employee_id") 
	REFERENCES "mdl_hrm"."employees"("id") 
	ON DELETE CASCADE;

-- Add indexes
CREATE INDEX IF NOT EXISTS "onboarding_checklists_employee_idx" ON "mdl_hrm"."onboarding_checklists"("employee_id");
CREATE INDEX IF NOT EXISTS "onboarding_checklists_assigned_idx" ON "mdl_hrm"."onboarding_checklists"("assigned_to");
CREATE INDEX IF NOT EXISTS "onboarding_checklists_completed_idx" ON "mdl_hrm"."onboarding_checklists"("is_completed");
