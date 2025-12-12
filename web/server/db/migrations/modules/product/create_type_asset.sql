-- Migration: Create type_asset table
-- Tạo bảng type_asset

CREATE TABLE "mdl_product"."type_asset" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"asset_code" varchar(100),
	"purchase_date" timestamp with time zone,
	"purchase_price" numeric(18, 4),
	"depreciation_method" varchar(30),
	"useful_life_years" integer,
	"residual_value" numeric(18, 4),
	"depreciation_rate" numeric(5, 2),
	"depreciation_start_date" timestamp with time zone,
	"current_value" numeric(18, 4),
	"location" varchar(200),
	"assigned_to_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "type_asset_product_variant_id_unique" UNIQUE("product_variant_id"),
	CONSTRAINT "type_asset_asset_code_unique" UNIQUE("asset_code")
);
