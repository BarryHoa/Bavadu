-- Migration: Create type_service table
-- Tạo bảng type_service

CREATE TABLE "mdl_product"."type_service" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"default_service_price" numeric(18, 4),
	"unit" varchar(20),
	"duration" integer,
	"detailed_description" text,
	"special_requirements" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "type_service_product_variant_id_unique" UNIQUE("product_variant_id")
);
