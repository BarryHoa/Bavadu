-- Migration: Create notifications table
-- Tạo bảng notifications

CREATE TABLE "mdl_hrm"."notifications" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"employee_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" jsonb NOT NULL,
	"message" jsonb NOT NULL,
	"link" varchar(500),
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone NOT NULL
);
