-- Migration: Create courses table
-- Tạo bảng courses

CREATE TABLE "mdl_hrm"."courses" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"category" varchar(100),
	"duration" integer,
	"format" varchar(50),
	"instructor" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "courses_code_unique" UNIQUE("code")
);
