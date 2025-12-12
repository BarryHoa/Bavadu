-- Migration: Create compliance_reports table
-- Tạo bảng compliance_reports

CREATE TABLE "mdl_hrm"."compliance_reports" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"report_number" varchar(100) NOT NULL,
	"report_type" varchar(50) NOT NULL,
	"reporting_period" varchar(50) NOT NULL,
	"report_date" date NOT NULL,
	"submitted_date" date,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"file_url" varchar(500),
	"data" jsonb,
	"notes" text,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "compliance_reports_report_number_unique" UNIQUE("report_number")
);
