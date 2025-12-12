-- Migration: Create goals table
-- Tạo bảng goals

CREATE TABLE "mdl_hrm"."goals" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"employee_id" uuid NOT NULL,
	"goal_type" varchar(50) NOT NULL,
	"title" jsonb NOT NULL,
	"description" jsonb,
	"target_value" integer,
	"current_value" integer DEFAULT 0,
	"unit" varchar(50),
	"period" varchar(50) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"progress" integer DEFAULT 0,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
