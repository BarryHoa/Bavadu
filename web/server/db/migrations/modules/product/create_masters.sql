-- Migration: Create masters table
-- Tạo bảng masters

CREATE TABLE "mdl_product"."masters" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"images" jsonb,
	"description" text,
	"type" varchar(20) NOT NULL,
	"features" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"brand" text,
	"category_id" uuid,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "masters_code_unique" UNIQUE("code")
);
