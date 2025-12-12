-- Migration: Create delivery_lines table
-- Tạo bảng delivery_lines

CREATE TABLE "mdl_sale_b2b"."delivery_lines" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"delivery_id" uuid NOT NULL,
	"order_type" varchar(10) NOT NULL,
	"order_line_id" uuid NOT NULL,
	"quantity" numeric(14, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
