-- Migration: Create product_packings table
-- Tạo bảng product_packings

-- ============================================
-- Product Packings
-- ============================================
CREATE TABLE IF NOT EXISTS "product_packings" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"name" jsonb NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "product_packings" ADD CONSTRAINT "product_packings_product_variant_id_product_variants_id_fk" 
FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "product_packings_variant_idx" ON "product_packings" USING btree ("product_variant_id");
CREATE INDEX IF NOT EXISTS "product_packings_active_idx" ON "product_packings" USING btree ("is_active");

