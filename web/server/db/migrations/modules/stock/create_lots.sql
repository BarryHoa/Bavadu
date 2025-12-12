-- Migration: Create lots table
-- Tạo bảng lots

CREATE TABLE "mdl_stock"."lots" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"lot_number" varchar(100),
	"batch_number" varchar(100),
	"purchase_order_line_id" uuid,
	"purchase_date" timestamp with time zone NOT NULL,
	"unit_cost" numeric(18, 4) NOT NULL,
	"quantity_received" numeric(14, 2) NOT NULL,
	"quantity_available" numeric(14, 2) NOT NULL,
	"quantity_reserved" numeric(14, 2) DEFAULT '0' NOT NULL,
	"expiry_date" timestamp with time zone,
	"manufacture_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
