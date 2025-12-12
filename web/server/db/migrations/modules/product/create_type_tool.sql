-- Migration: Create type_tool table
-- Tạo bảng type_tool

CREATE TABLE "mdl_product"."type_tool" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"serial_number" varchar(100),
	"model_number" varchar(100),
	"purchase_date" timestamp with time zone,
	"purchase_price" numeric(18, 4),
	"warranty_period_months" integer,
	"maintenance_interval_days" integer,
	"last_maintenance_date" timestamp with time zone,
	"next_maintenance_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'in-use',
	"location" varchar(200),
	"assigned_to_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "type_tool_product_variant_id_unique" UNIQUE("product_variant_id"),
	CONSTRAINT "type_tool_serial_number_unique" UNIQUE("serial_number")
);
