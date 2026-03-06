-- Migration: Create notifications table (base - dùng chung toàn hệ thống)
-- Tạo bảng notifications

CREATE TABLE IF NOT EXISTS "md_base"."notifications" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "md_base"."users"("id") ON DELETE CASCADE,
	"type" varchar(50) NOT NULL,
	"title" jsonb NOT NULL,
	"message" jsonb NOT NULL,
	"link" varchar(500),
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone NOT NULL
);

CREATE INDEX IF NOT EXISTS "notifications_user_idx" ON "md_base"."notifications"("user_id");
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "md_base"."notifications"("type");
CREATE INDEX IF NOT EXISTS "notifications_read_idx" ON "md_base"."notifications"("is_read");
CREATE INDEX IF NOT EXISTS "notifications_user_read_idx" ON "md_base"."notifications"("user_id", "is_read");
