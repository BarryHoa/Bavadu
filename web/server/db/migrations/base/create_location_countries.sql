-- Migration: Create location_countries table
-- Tạo bảng location_countries

-- ============================================
-- Location Countries
-- ============================================
CREATE TABLE IF NOT EXISTS "location_countries" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(2) NOT NULL,
	"name" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "location_countries_code_unique" UNIQUE("code")
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "location_countries_code_idx" ON "location_countries" USING btree ("code");
CREATE INDEX IF NOT EXISTS "location_countries_is_active_idx" ON "location_countries" USING btree ("is_active");

