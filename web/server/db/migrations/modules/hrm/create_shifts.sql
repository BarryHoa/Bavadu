-- Migration: Create shifts table
-- Tạo bảng shifts

CREATE TABLE "mdl_hrm"."shifts" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"description" text,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"break_duration" integer DEFAULT 0,
	"working_hours" integer NOT NULL,
	"is_night_shift" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "shifts_code_unique" UNIQUE("code")
);
