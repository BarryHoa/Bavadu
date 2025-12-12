-- Migration: Create price_tiers table
-- Tạo bảng price_tiers

CREATE TABLE "mdl_sale_b2c"."price_tiers" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"price_list_item_id" uuid,
	"pricing_rule_id" uuid,
	"min_quantity" numeric(14, 2) NOT NULL,
	"max_quantity" numeric(14, 2),
	"price" numeric(18, 4) NOT NULL,
	"discount_percentage" numeric(5, 2),
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
