-- Migration: Create positions table
-- Tạo bảng positions

CREATE TABLE "mdl_hrm"."positions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"description" text,
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

-- Add foreign key constraints
ALTER TABLE "mdl_hrm"."positions"
	ADD CONSTRAINT "positions_department_id_departments_id_fk"
	FOREIGN KEY ("department_id") 
	REFERENCES "mdl_hrm"."departments"("id") 
	ON DELETE RESTRICT;

ALTER TABLE "mdl_hrm"."positions"
	ADD CONSTRAINT "positions_reports_to_positions_id_fk"
	FOREIGN KEY ("reports_to") 
	REFERENCES "mdl_hrm"."positions"("id") 
	ON DELETE NO ACTION;

-- Add indexes
CREATE INDEX IF NOT EXISTS "positions_department_idx" ON "mdl_hrm"."positions"("department_id");
CREATE INDEX IF NOT EXISTS "positions_reports_to_idx" ON "mdl_hrm"."positions"("reports_to");
CREATE INDEX IF NOT EXISTS "positions_active_idx" ON "mdl_hrm"."positions"("is_active");
