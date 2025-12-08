-- Migration: Create product_attributes table
-- Tạo bảng product_attributes

-- ============================================
-- Product Attributes
-- ============================================
CREATE TABLE IF NOT EXISTS "product_attributes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_product_variant_id_product_variants_id_fk" 
FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "product_attributes_variant_idx" ON "product_attributes" USING btree ("product_variant_id");
CREATE INDEX IF NOT EXISTS "product_attributes_code_idx" ON "product_attributes" USING btree ("code");

