-- Migration: Create job_requisitions table
-- Tạo bảng job_requisitions

CREATE TABLE "mdl_hrm"."job_requisitions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"requisition_number" varchar(100) NOT NULL,
	"title" jsonb NOT NULL,
	"description" text,
	"department_id" uuid NOT NULL,
	"position_id" uuid NOT NULL,
	"number_of_openings" integer DEFAULT 1 NOT NULL,
	"priority" varchar(50) DEFAULT 'normal',
	"employment_type" varchar(50),
	"min_salary" integer,
	"max_salary" integer,
	"currency" varchar(10) DEFAULT 'VND',
	"requirements" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"opened_date" date,
	"closed_date" date,
	"hiring_manager_id" uuid,
	"recruiter_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "job_requisitions_requisition_number_unique" UNIQUE("requisition_number")
);

-- Add foreign key constraints
ALTER TABLE "mdl_hrm"."job_requisitions"
	ADD CONSTRAINT "job_requisitions_department_id_departments_id_fk"
	FOREIGN KEY ("department_id") 
	REFERENCES "mdl_hrm"."departments"("id") 
	ON DELETE RESTRICT;

ALTER TABLE "mdl_hrm"."job_requisitions"
	ADD CONSTRAINT "job_requisitions_position_id_positions_id_fk"
	FOREIGN KEY ("position_id") 
	REFERENCES "mdl_hrm"."positions"("id") 
	ON DELETE RESTRICT;

-- Add indexes
CREATE INDEX IF NOT EXISTS "job_requisitions_number_idx" ON "mdl_hrm"."job_requisitions"("requisition_number");
CREATE INDEX IF NOT EXISTS "job_requisitions_department_idx" ON "mdl_hrm"."job_requisitions"("department_id");
CREATE INDEX IF NOT EXISTS "job_requisitions_position_idx" ON "mdl_hrm"."job_requisitions"("position_id");
CREATE INDEX IF NOT EXISTS "job_requisitions_status_idx" ON "mdl_hrm"."job_requisitions"("status");
