-- Migration: Create leave_requests table
-- Tạo bảng leave_requests

CREATE TABLE "mdl_hrm"."leave_requests" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "md_base"."users"("id") ON DELETE CASCADE,
	"leave_type_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"days" integer NOT NULL,
	"reason" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"workflow_instance_id" uuid,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"rejected_by" uuid,
	"rejected_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

CREATE INDEX IF NOT EXISTS "leave_requests_user_idx" ON "mdl_hrm"."leave_requests"("user_id");
CREATE INDEX IF NOT EXISTS "leave_requests_type_idx" ON "mdl_hrm"."leave_requests"("leave_type_id");
CREATE INDEX IF NOT EXISTS "leave_requests_status_idx" ON "mdl_hrm"."leave_requests"("status");
CREATE INDEX IF NOT EXISTS "leave_requests_dates_idx" ON "mdl_hrm"."leave_requests"("start_date", "end_date");
