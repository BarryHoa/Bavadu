-- Migration: Create performance_reviews table
-- Tạo bảng performance_reviews

CREATE TABLE "mdl_hrm"."performance_reviews" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"employee_id" uuid NOT NULL,
	"review_type" varchar(50) NOT NULL,
	"review_period" varchar(50),
	"review_date" date NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"overall_rating" integer,
	"strengths" text,
	"areas_for_improvement" text,
	"goals" jsonb,
	"feedback" text,
	"employee_comments" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"completed_date" date,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
