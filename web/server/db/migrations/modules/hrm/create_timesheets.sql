-- Migration: Create timesheets table
-- Tạo bảng timesheets

CREATE TABLE "mdl_hrm"."timesheets" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"employee_id" uuid NOT NULL,
	"roster_id" uuid,
	"work_date" date NOT NULL,
	"shift_id" uuid,
	"check_in_time" timestamp with time zone,
	"check_out_time" timestamp with time zone,
	"actual_hours" integer,
	"regular_hours" integer,
	"overtime_hours" integer DEFAULT 0,
	"break_duration" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"check_in_method" varchar(50),
	"check_out_method" varchar(50),
	"check_in_location" varchar(255),
	"check_out_location" varchar(255),
	"notes" varchar(500),
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
