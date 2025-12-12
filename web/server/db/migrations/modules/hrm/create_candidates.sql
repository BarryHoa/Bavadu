-- Migration: Create candidates table
-- Tạo bảng candidates

CREATE TABLE "mdl_hrm"."candidates" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"requisition_id" uuid NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"full_name" jsonb NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"date_of_birth" date,
	"gender" varchar(20),
	"address" jsonb,
	"cv_url" varchar(500),
	"cover_letter" text,
	"source" varchar(100),
	"status" varchar(50) DEFAULT 'applied' NOT NULL,
	"stage" varchar(50),
	"rating" integer,
	"notes" text,
	"applied_date" timestamp with time zone,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
