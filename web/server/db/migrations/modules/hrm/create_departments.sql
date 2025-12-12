-- Migration: Create departments table
-- Tạo bảng departments

CREATE TABLE "mdl_hrm"."departments" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
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
