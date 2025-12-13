-- Migration: Create departments table
-- Tạo bảng departments

CREATE TABLE "mdl_hrm"."departments" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"description" text,
	"parent_id" uuid,
	"level" integer DEFAULT 1 NOT NULL,
	"manager_id" uuid,
	"location_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "departments_code_unique" UNIQUE("code")
);

-- Add foreign key constraint for self-referencing parent_id
ALTER TABLE "mdl_hrm"."departments"
	ADD CONSTRAINT "departments_parent_id_departments_id_fk"
	FOREIGN KEY ("parent_id") 
	REFERENCES "mdl_hrm"."departments"("id") 
	ON DELETE NO ACTION;

-- Add indexes
CREATE INDEX IF NOT EXISTS "departments_parent_idx" ON "mdl_hrm"."departments"("parent_id");
CREATE INDEX IF NOT EXISTS "departments_manager_idx" ON "mdl_hrm"."departments"("manager_id");
CREATE INDEX IF NOT EXISTS "departments_active_idx" ON "mdl_hrm"."departments"("is_active");
