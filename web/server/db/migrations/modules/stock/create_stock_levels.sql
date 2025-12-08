-- Migration: Create stock_levels table
-- Tạo bảng stock_levels

-- ============================================
-- Stock Levels
-- ============================================
CREATE TABLE IF NOT EXISTS "stock_levels" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"quantity" numeric(14, 2) DEFAULT '0' NOT NULL,
	"reserved_quantity" numeric(14, 2) DEFAULT '0' NOT NULL,
	"average_cost" numeric(18, 4) DEFAULT '0' NOT NULL,
	"total_cost_value" numeric(18, 4) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_product_id_product_masters_id_fk" 
FOREIGN KEY ("product_id") REFERENCES "public"."product_masters"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_warehouse_id_stock_warehouses_id_fk" 
FOREIGN KEY ("warehouse_id") REFERENCES "public"."stock_warehouses"("id") ON DELETE cascade ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS "stock_levels_product_warehouse_unique" ON "stock_levels" USING btree ("product_id","warehouse_id");
CREATE INDEX IF NOT EXISTS "stock_levels_product_idx" ON "stock_levels" USING btree ("product_id");
CREATE INDEX IF NOT EXISTS "stock_levels_warehouse_idx" ON "stock_levels" USING btree ("warehouse_id");
CREATE INDEX IF NOT EXISTS "stock_levels_warehouse_quantity_idx" ON "stock_levels" USING btree ("warehouse_id","quantity");

