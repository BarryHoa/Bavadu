-- Migration: Create cost_variances table
-- Tạo bảng cost_variances

CREATE TABLE "mdl_stock"."cost_variances" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"purchase_order_line_id" uuid,
	"standard_cost" numeric(18, 4) NOT NULL,
	"actual_cost" numeric(18, 4) NOT NULL,
	"variance" numeric(18, 4) NOT NULL,
	"quantity" numeric(14, 2) NOT NULL,
	"total_variance" numeric(18, 4) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
