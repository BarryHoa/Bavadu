-- Migration: Create product_type_goods table
-- Tạo bảng product_type_goods

-- ============================================
-- Product Type Goods
-- ============================================
CREATE TABLE IF NOT EXISTS "product_type_goods" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"default_sale_price" numeric(18, 4),
	"default_purchase_price" numeric(18, 4),
	"weight" numeric(10, 2),
	"dimensions" jsonb,
	"color" varchar(50),
	"style" varchar(100),
	"expiry_date" timestamp with time zone,
	"expiry_tracking" boolean DEFAULT false,
	"storage_conditions" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "product_type_goods_product_variant_id_unique" UNIQUE("product_variant_id")
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "product_type_goods" ADD CONSTRAINT "product_type_goods_product_variant_id_product_variants_id_fk" 
FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "product_type_goods_variant_idx" ON "product_type_goods" USING btree ("product_variant_id");
CREATE INDEX IF NOT EXISTS "product_type_goods_expiry_idx" ON "product_type_goods" USING btree ("expiry_date");

