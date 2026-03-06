-- Migration: Create rosters table
-- Tạo bảng rosters

CREATE TABLE "mdl_hrm"."rosters" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "md_base"."users"("id") ON DELETE CASCADE,
	"shift_id" uuid NOT NULL,
	"work_date" date NOT NULL,
	"status" varchar(50) DEFAULT 'scheduled' NOT NULL,
	"notes" varchar(500),
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

CREATE INDEX IF NOT EXISTS "rosters_user_idx" ON "mdl_hrm"."rosters"("user_id");
CREATE INDEX IF NOT EXISTS "rosters_shift_idx" ON "mdl_hrm"."rosters"("shift_id");
CREATE INDEX IF NOT EXISTS "rosters_date_idx" ON "mdl_hrm"."rosters"("work_date");
CREATE INDEX IF NOT EXISTS "rosters_user_date_idx" ON "mdl_hrm"."rosters"("user_id", "work_date");
