-- Migration: Create product_type_finished_good table
-- Tạo bảng product_type_finished_good

-- ============================================
-- Product Type Finished Good
-- ============================================
CREATE TABLE IF NOT EXISTS "product_type_finished_good" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"default_sale_price" numeric(18, 4),
	"default_manufacturing_cost" numeric(18, 4),
	"bom_id" uuid,
	"production_time" integer,
	"production_unit" varchar(50),
	"quality_standard" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "product_type_finished_good_product_variant_id_unique" UNIQUE("product_variant_id")
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "product_type_finished_good" ADD CONSTRAINT "product_type_finished_good_product_variant_id_product_variants_id_fk" 
FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;

