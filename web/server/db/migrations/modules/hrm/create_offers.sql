-- Migration: Create offers table
-- Tạo bảng offers

CREATE TABLE "mdl_hrm"."offers" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"offer_number" varchar(100) NOT NULL,
	"position_title" jsonb NOT NULL,
	"base_salary" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'VND',
	"start_date" date NOT NULL,
	"employment_type" varchar(50),
	"benefits" jsonb,
	"terms" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"sent_date" timestamp with time zone,
	"expiry_date" date,
	"accepted_date" timestamp with time zone,
	"rejected_date" timestamp with time zone,
	"rejection_reason" text,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "offers_offer_number_unique" UNIQUE("offer_number")
);
