-- Migration: Create settings table
-- Tạo bảng settings

CREATE TABLE "mdl_stock"."settings" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"min_stock_level" numeric(14, 2),
	"reorder_point" numeric(14, 2),
	"max_stock_level" numeric(14, 2),
	"lead_time" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
