-- Migration: Create units_of_measure table
-- Tạo bảng units_of_measure

-- ============================================
-- Units of Measure
-- ============================================
CREATE TABLE IF NOT EXISTS "units_of_measure" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" jsonb NOT NULL,
	"symbol" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "units_of_measure_symbol_idx" ON "units_of_measure" USING btree ("symbol");
CREATE INDEX IF NOT EXISTS "units_of_measure_active_idx" ON "units_of_measure" USING btree ("is_active");

