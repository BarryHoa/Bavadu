-- Migration: Create product_type_consumable table
-- Tạo bảng product_type_consumable

-- ============================================
-- Product Type Consumable
-- ============================================
CREATE TABLE IF NOT EXISTS "product_type_consumable" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"default_purchase_price" numeric(18, 4),
	"default_min_stock_level" numeric(14, 2),
	"default_reorder_point" numeric(14, 2),
	"expiry_tracking" boolean DEFAULT false,
	"storage_conditions" text,
	"packaging_unit" varchar(50),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "product_type_consumable_product_variant_id_unique" UNIQUE("product_variant_id")
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "product_type_consumable" ADD CONSTRAINT "product_type_consumable_product_variant_id_product_variants_id_fk" 
FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;

