-- Migration: Create users table
-- Tạo bảng users

-- ============================================
-- Users
-- ============================================
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"avatar" varchar(512),
	"gender" varchar(10),
	"date_of_birth" timestamp with time zone,
	"bio" varchar(120),
	"first_name" varchar(50),
	"last_name" varchar(50),
	"phones" varchar(20)[],
	"addresses" varchar(225)[],
	"emails" varchar(255)[],
	"position" varchar(100),
	"department" varchar(100),
	"joined_at" timestamp with time zone,
	"salary" varchar(50),
	"address" jsonb,
	"notes" varchar(255),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "users_status_idx" ON "users" USING btree ("status");
CREATE INDEX IF NOT EXISTS "users_department_idx" ON "users" USING btree ("department");
CREATE INDEX IF NOT EXISTS "users_joined_idx" ON "users" USING btree ("joined_at");
CREATE INDEX IF NOT EXISTS "users_lastname_idx" ON "users" USING btree ("last_name");

