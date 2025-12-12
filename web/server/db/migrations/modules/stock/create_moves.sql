-- Migration: Create moves table
-- Tạo bảng moves

CREATE TABLE "mdl_stock"."moves" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" numeric(14, 2) NOT NULL,
	"type" varchar(32) NOT NULL,
	"source_warehouse_id" uuid,
	"target_warehouse_id" uuid,
	"reference" varchar(128),
	"note" varchar(256),
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36)
);
