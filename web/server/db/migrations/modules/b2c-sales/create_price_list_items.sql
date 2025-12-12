-- Migration: Create price_list_items table
-- Tạo bảng price_list_items

CREATE TABLE "mdl_sale_b2c"."price_list_items" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"price_list_id" uuid NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"product_master_id" uuid NOT NULL,
	"pricing_type" varchar(20) DEFAULT 'fixed' NOT NULL,
	"base_price" numeric(18, 4),
	"sale_price" numeric(18, 4),
	"discount_type" varchar(20),
	"discount_value" numeric(18, 4),
	"final_price" numeric(18, 4),
	"min_quantity" numeric(14, 2) DEFAULT '1' NOT NULL,
	"max_quantity" numeric(14, 2),
	"uom_id" uuid,
	"tax_included" boolean DEFAULT false NOT NULL,
	"tax_rate_id" uuid,
	"valid_from" timestamp with time zone,
	"valid_to" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
