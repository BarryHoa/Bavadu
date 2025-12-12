-- Migration: Create type_consumable table
-- Tạo bảng type_consumable

CREATE TABLE "mdl_product"."type_consumable" (
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
	CONSTRAINT "type_consumable_product_variant_id_unique" UNIQUE("product_variant_id")
);
