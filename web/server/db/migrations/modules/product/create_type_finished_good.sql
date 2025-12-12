-- Migration: Create type_finished_good table
-- Tạo bảng type_finished_good

CREATE TABLE "mdl_product"."type_finished_good" (
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
	CONSTRAINT "type_finished_good_product_variant_id_unique" UNIQUE("product_variant_id")
);
