-- Migration: Create audit_logs table
-- Tạo bảng audit_logs

CREATE TABLE "mdl_hrm"."audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" varchar(50) NOT NULL,
	"performed_by" uuid NOT NULL,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"changes" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone NOT NULL
);
