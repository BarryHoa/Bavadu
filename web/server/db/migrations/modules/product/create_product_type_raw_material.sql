-- Migration: Create product_type_raw_material table
-- Tạo bảng product_type_raw_material

-- ============================================
-- Product Type Raw Material
-- ============================================
CREATE TABLE IF NOT EXISTS "product_type_raw_material" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"default_purchase_price" numeric(18, 4),
	"specifications" jsonb,
	"quality_standard" text,
	"primary_supplier_id" uuid,
	"lead_time_days" integer,
	"safety_stock" numeric(14, 2),
	"default_reorder_point" numeric(14, 2),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "product_type_raw_material_product_variant_id_unique" UNIQUE("product_variant_id")
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "product_type_raw_material" ADD CONSTRAINT "product_type_raw_material_product_variant_id_product_variants_id_fk" 
FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;

