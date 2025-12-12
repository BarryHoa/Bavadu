-- Migration: Create offboarding table
-- Tạo bảng offboarding

CREATE TABLE "mdl_hrm"."offboarding" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"employee_id" uuid NOT NULL,
	"resignation_date" date NOT NULL,
	"last_working_date" date NOT NULL,
	"reason" varchar(50),
	"reason_details" text,
	"exit_interview_date" date,
	"exit_interview_notes" text,
	"handover_notes" text,
	"assets_returned" jsonb,
	"status" varchar(50) DEFAULT 'initiated' NOT NULL,
	"completed_date" date,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
