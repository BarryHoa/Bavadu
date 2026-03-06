-- Migration: Create timesheets table
-- Tạo bảng timesheets (user_id tham chiếu md_base.users)

CREATE TABLE "mdl_hrm"."timesheets" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "md_base"."users"("id") ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS "timesheets_user_idx" ON "mdl_hrm"."timesheets"("user_id");
CREATE INDEX IF NOT EXISTS "timesheets_date_idx" ON "mdl_hrm"."timesheets"("work_date");
CREATE INDEX IF NOT EXISTS "timesheets_user_date_idx" ON "mdl_hrm"."timesheets"("user_id", "work_date");
CREATE INDEX IF NOT EXISTS "timesheets_status_idx" ON "mdl_hrm"."timesheets"("status");
