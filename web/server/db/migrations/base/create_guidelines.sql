-- Migration: Create guidelines table
-- Tạo bảng guidelines

-- ============================================
-- Guidelines
-- ============================================
CREATE TABLE IF NOT EXISTS "md_base"."guidelines" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"key" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guidelines_key_unique" UNIQUE("key")
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "guidelines_key_idx" ON "md_base"."guidelines" USING btree ("key");

