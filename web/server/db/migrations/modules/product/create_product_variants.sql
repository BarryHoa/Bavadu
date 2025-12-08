-- Migration: Create product_variants table
-- Tạo bảng product_variants

-- ============================================
-- Product Variants
-- ============================================
CREATE TABLE IF NOT EXISTS "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_master_id" uuid NOT NULL,
	"name" jsonb NOT NULL,
	"description" text,
	"images" jsonb,
	"sku" varchar(100),
	"barcode" varchar(100),
	"manufacturer" jsonb,
	"base_uom_id" uuid,
	"cost_method" varchar(20) DEFAULT 'average' NOT NULL,
	"standard_cost" numeric(18, 4),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_master_id_product_masters_id_fk" 
FOREIGN KEY ("product_master_id") REFERENCES "public"."product_masters"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_base_uom_id_units_of_measure_id_fk" 
FOREIGN KEY ("base_uom_id") REFERENCES "public"."units_of_measure"("id") ON DELETE no action ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "product_variants_master_idx" ON "product_variants" USING btree ("product_master_id");
CREATE INDEX IF NOT EXISTS "product_variants_sku_idx" ON "product_variants" USING btree ("sku");
CREATE INDEX IF NOT EXISTS "product_variants_barcode_idx" ON "product_variants" USING btree ("barcode");
CREATE INDEX IF NOT EXISTS "product_variants_active_idx" ON "product_variants" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "product_variants_base_uom_idx" ON "product_variants" USING btree ("base_uom_id");
CREATE INDEX IF NOT EXISTS "product_variants_cost_method_idx" ON "product_variants" USING btree ("cost_method");
CREATE INDEX IF NOT EXISTS "product_variants_master_active_idx" ON "product_variants" USING btree ("product_master_id","is_active");

