-- Migration: Create uom_conversions table
-- Tạo bảng uom_conversions

CREATE TABLE "mdl_product"."uom_conversions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"uom_id" uuid NOT NULL,
	"conversion_ratio" numeric(15, 6) NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
