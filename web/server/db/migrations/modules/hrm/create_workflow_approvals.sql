-- Migration: Create workflow_approvals table
-- Tạo bảng workflow_approvals

CREATE TABLE "mdl_hrm"."workflow_approvals" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"instance_id" uuid NOT NULL,
	"step" integer NOT NULL,
	"approver_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"comments" varchar(1000),
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone
);
