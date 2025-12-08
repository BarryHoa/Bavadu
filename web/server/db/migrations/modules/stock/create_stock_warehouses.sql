-- Migration: Create stock_warehouses table
-- Tạo bảng stock_warehouses

-- ============================================
-- Stock Warehouses
-- ============================================
CREATE TABLE IF NOT EXISTS "stock_warehouses" (
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
	CONSTRAINT "stock_warehouses_status_check" CHECK ("stock_warehouses"."status" IN ('ACTIVE', 'MAINTENANCE', 'SUSPENDED', 'CLOSED')),
	CONSTRAINT "stock_warehouses_valuation_check" CHECK ("stock_warehouses"."valuation_method" IN ('FIFO', 'LIFO', 'AVG')),
	CONSTRAINT "stock_warehouses_min_stock_check" CHECK ("stock_warehouses"."min_stock"::numeric >= 0),
	CONSTRAINT "stock_warehouses_min_max_check" CHECK (("stock_warehouses"."max_stock" IS NULL) OR ("stock_warehouses"."max_stock"::numeric >= "stock_warehouses"."min_stock"::numeric))
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "stock_warehouses" ADD CONSTRAINT "stock_warehouses_manager_id_users_id_fk" 
FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "stock_warehouses" ADD CONSTRAINT "stock_warehouses_contact_id_users_id_fk" 
FOREIGN KEY ("contact_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS "stock_warehouses_code_unique" ON "stock_warehouses" USING btree ("code");
CREATE INDEX IF NOT EXISTS "stock_warehouses_company_idx" ON "stock_warehouses" USING btree ("company_id");
CREATE INDEX IF NOT EXISTS "stock_warehouses_status_idx" ON "stock_warehouses" USING btree ("status");
CREATE INDEX IF NOT EXISTS "stock_warehouses_type_idx" ON "stock_warehouses" USING btree ("type_code");

