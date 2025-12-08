-- Migration: Create product_type_service table
-- Tạo bảng product_type_service

-- ============================================
-- Product Type Service
-- ============================================
CREATE TABLE IF NOT EXISTS "product_type_service" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"default_service_price" numeric(18, 4),
	"unit" varchar(20),
	"duration" integer,
	"detailed_description" text,
	"special_requirements" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "product_type_service_product_variant_id_unique" UNIQUE("product_variant_id")
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "product_type_service" ADD CONSTRAINT "product_type_service_product_variant_id_product_variants_id_fk" 
FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;

