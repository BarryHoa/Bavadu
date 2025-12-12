-- Migration: Create type_goods table
-- Tạo bảng type_goods

CREATE TABLE "mdl_product"."type_goods" (
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
	CONSTRAINT "type_goods_product_variant_id_unique" UNIQUE("product_variant_id")
);
