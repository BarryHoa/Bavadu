-- Migration: Create pricing_rules table
-- Tạo bảng pricing_rules

CREATE TABLE "mdl_sale_b2c"."pricing_rules" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"price_list_id" uuid NOT NULL,
	"conditions" jsonb NOT NULL,
	"pricing_method" varchar(20) NOT NULL,
	"fixed_price" numeric(18, 4),
	"discount_type" varchar(20),
	"discount_value" numeric(18, 4),
	"formula" text,
	"min_quantity" numeric(14, 2) DEFAULT '1' NOT NULL,
	"max_quantity" numeric(14, 2),
	"priority" integer DEFAULT 0 NOT NULL,
	"valid_from" timestamp with time zone,
	"valid_to" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"apply_to_exceptions" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
