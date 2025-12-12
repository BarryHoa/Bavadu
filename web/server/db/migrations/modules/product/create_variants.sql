-- Migration: Create variants table
-- Tạo bảng variants

CREATE TABLE "mdl_product"."variants" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_master_id" uuid NOT NULL,
	"name" jsonb NOT NULL,
	"description" text,
	"images" jsonb,
	"sku" varchar(100),
	"barcode" varchar(100),
	"manufacturer" jsonb,
	"base_uom_id" uuid,
	"sale_uom_id" uuid,
	"purchase_uom_id" uuid,
	"manufacturing_uom_id" uuid,
	"cost_method" varchar(20) DEFAULT 'average' NOT NULL,
	"standard_cost" numeric(18, 4),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
