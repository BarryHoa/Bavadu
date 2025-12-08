-- Migration: Create uom_conversions table
-- Tạo bảng uom_conversions

-- ============================================
-- UOM Conversions
-- ============================================
CREATE TABLE IF NOT EXISTS "uom_conversions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"uom_id" uuid NOT NULL,
	"conversion_ratio" numeric(15, 6) NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "uom_conversions" ADD CONSTRAINT "uom_conversions_uom_id_units_of_measure_id_fk" 
FOREIGN KEY ("uom_id") REFERENCES "public"."units_of_measure"("id") ON DELETE no action ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "uom_conversions_uom_idx" ON "uom_conversions" USING btree ("uom_id");

