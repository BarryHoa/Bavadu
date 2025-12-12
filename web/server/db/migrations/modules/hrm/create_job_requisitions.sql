-- Migration: Create job_requisitions table
-- Tạo bảng job_requisitions

CREATE TABLE "mdl_hrm"."job_requisitions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"requisition_number" varchar(100) NOT NULL,
	"title" jsonb NOT NULL,
	"description" jsonb,
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
