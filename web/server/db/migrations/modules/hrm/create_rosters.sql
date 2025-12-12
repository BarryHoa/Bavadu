-- Migration: Create rosters table
-- Tạo bảng rosters

CREATE TABLE "mdl_hrm"."rosters" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"employee_id" uuid NOT NULL,
	"shift_id" uuid NOT NULL,
	"work_date" date NOT NULL,
	"status" varchar(50) DEFAULT 'scheduled' NOT NULL,
	"notes" varchar(500),
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
