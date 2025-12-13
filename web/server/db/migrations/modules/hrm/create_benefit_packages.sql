-- Migration: Create benefit_packages table
-- Tạo bảng benefit_packages

CREATE TABLE "mdl_hrm"."benefit_packages" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"description" text,
	"benefit_type" varchar(50) NOT NULL,
	"coverage" jsonb,
	"cost" integer,
	"currency" varchar(10) DEFAULT 'VND',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "benefit_packages_code_unique" UNIQUE("code")
);
