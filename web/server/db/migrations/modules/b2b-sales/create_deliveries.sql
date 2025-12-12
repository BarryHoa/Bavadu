-- Migration: Create deliveries table
-- Tạo bảng deliveries

CREATE TABLE "mdl_sale_b2b"."deliveries" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"order_type" varchar(10) NOT NULL,
	"order_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"delivery_date" timestamp with time zone NOT NULL,
	"reference" varchar(128),
	"note" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36)
);
