-- Migration: Create roles table
-- Tạo bảng roles

CREATE TABLE "mdl_hrm"."roles" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"permissions" jsonb NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "roles_code_unique" UNIQUE("code")
);
