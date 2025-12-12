-- Migration: Create attributes table
-- Tạo bảng attributes

CREATE TABLE "mdl_product"."attributes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
