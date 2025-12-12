-- Migration: Create type_raw_material table
-- Tạo bảng type_raw_material

CREATE TABLE "mdl_product"."type_raw_material" (
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
	CONSTRAINT "type_raw_material_product_variant_id_unique" UNIQUE("product_variant_id")
);
