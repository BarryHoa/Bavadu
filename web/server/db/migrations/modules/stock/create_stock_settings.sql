-- Migration: Create stock_settings table
-- Tạo bảng stock_settings

-- ============================================
-- Stock Settings
-- ============================================
CREATE TABLE IF NOT EXISTS "stock_settings" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"min_stock_level" numeric(14, 2),
	"reorder_point" numeric(14, 2),
	"max_stock_level" numeric(14, 2),
	"lead_time" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "stock_settings" ADD CONSTRAINT "stock_settings_product_id_product_masters_id_fk" 
FOREIGN KEY ("product_id") REFERENCES "public"."product_masters"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "stock_settings" ADD CONSTRAINT "stock_settings_warehouse_id_stock_warehouses_id_fk" 
FOREIGN KEY ("warehouse_id") REFERENCES "public"."stock_warehouses"("id") ON DELETE cascade ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS "stock_settings_product_warehouse_unique" ON "stock_settings" USING btree ("product_id","warehouse_id");
CREATE INDEX IF NOT EXISTS "stock_settings_product_idx" ON "stock_settings" USING btree ("product_id");
CREATE INDEX IF NOT EXISTS "stock_settings_warehouse_idx" ON "stock_settings" USING btree ("warehouse_id");
CREATE INDEX IF NOT EXISTS "stock_settings_min_stock_idx" ON "stock_settings" USING btree ("min_stock_level");
CREATE INDEX IF NOT EXISTS "stock_settings_warehouse_reorder_idx" ON "stock_settings" USING btree ("warehouse_id","reorder_point");

