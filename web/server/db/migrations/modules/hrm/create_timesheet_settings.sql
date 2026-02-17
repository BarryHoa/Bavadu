-- Migration: Create timesheet_settings table
-- Cấu hình chấm công: giờ vào/ra mặc định, break, làm tròn, v.v.

CREATE TABLE "mdl_hrm"."timesheet_settings" (
	"id" varchar(50) PRIMARY KEY DEFAULT 'default',
	"default_check_in_time" time,
	"default_check_out_time" time,
	"break_minutes" integer NOT NULL DEFAULT 60,
	"max_hours_per_day" integer,
	"allow_weekend" boolean NOT NULL DEFAULT false,
	"week_start" integer NOT NULL DEFAULT 1,
	"round_minutes" integer NOT NULL DEFAULT 15,
	"round_direction" varchar(20) NOT NULL DEFAULT 'nearest',
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"updated_by" varchar(36)
);

INSERT INTO "mdl_hrm"."timesheet_settings" (
	"id",
	"default_check_in_time",
	"default_check_out_time",
	"break_minutes",
	"round_minutes",
	"round_direction"
) VALUES (
	'default',
	'09:00',
	'18:00',
	60,
	15,
	'nearest'
);
