-- Migration: Create interviews table
-- Tạo bảng interviews

CREATE TABLE "mdl_hrm"."interviews" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"interview_type" varchar(50) NOT NULL,
	"scheduled_date" timestamp with time zone NOT NULL,
	"duration" integer,
	"location" varchar(255),
	"interviewer_ids" jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'scheduled' NOT NULL,
	"feedback" text,
	"rating" integer,
	"recommendation" varchar(50),
	"notes" text,
	"conducted_by" uuid,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
