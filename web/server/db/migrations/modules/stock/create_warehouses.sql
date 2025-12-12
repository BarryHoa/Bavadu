-- Migration: Create warehouses table
-- Tạo bảng warehouses

CREATE TABLE "mdl_stock"."warehouses" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(64) NOT NULL,
	"name" varchar(128) NOT NULL,
	"type_code" varchar(30) NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"company_id" uuid,
	"manager_id" uuid,
	"contact_id" uuid,
	"address" jsonb NOT NULL,
	"valuation_method" varchar(10) DEFAULT 'FIFO' NOT NULL,
	"min_stock" numeric(18, 4) DEFAULT '0' NOT NULL,
	"max_stock" numeric(18, 4),
	"account_inventory" varchar(30),
	"account_adjustment" varchar(30),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "warehouses_status_check" CHECK ("mdl_stock"."warehouses"."status" IN ('ACTIVE', 'MAINTENANCE', 'SUSPENDED', 'CLOSED')),
	CONSTRAINT "warehouses_valuation_check" CHECK ("mdl_stock"."warehouses"."valuation_method" IN ('FIFO', 'LIFO', 'AVG')),
	CONSTRAINT "warehouses_min_stock_check" CHECK ("mdl_stock"."warehouses"."min_stock"::numeric >= 0),
	CONSTRAINT "warehouses_min_max_check" CHECK (("mdl_stock"."warehouses"."max_stock" IS NULL) OR ("mdl_stock"."warehouses"."max_stock"::numeric >= "mdl_stock"."warehouses"."min_stock"::numeric))
);
