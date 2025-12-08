-- Migration: Create stock_lots table
-- Tạo bảng stock_lots

-- ============================================
-- Stock Lots
-- ============================================
CREATE TABLE IF NOT EXISTS "stock_lots" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"lot_number" varchar(100),
	"batch_number" varchar(100),
	"purchase_order_line_id" uuid,
	"purchase_date" timestamp with time zone NOT NULL,
	"unit_cost" numeric(18, 4) NOT NULL,
	"quantity_received" numeric(14, 2) NOT NULL,
	"quantity_available" numeric(14, 2) NOT NULL,
	"quantity_reserved" numeric(14, 2) DEFAULT '0' NOT NULL,
	"expiry_date" timestamp with time zone,
	"manufacture_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "stock_lots" ADD CONSTRAINT "stock_lots_product_variant_id_product_variants_id_fk" 
FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "stock_lots" ADD CONSTRAINT "stock_lots_warehouse_id_stock_warehouses_id_fk" 
FOREIGN KEY ("warehouse_id") REFERENCES "public"."stock_warehouses"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "stock_lots" ADD CONSTRAINT "stock_lots_purchase_order_line_id_purchase_order_lines_id_fk" 
FOREIGN KEY ("purchase_order_line_id") REFERENCES "public"."purchase_order_lines"("id") ON DELETE set null ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "stock_lots_variant_warehouse_idx" ON "stock_lots" USING btree ("product_variant_id","warehouse_id");
CREATE INDEX IF NOT EXISTS "stock_lots_lot_number_idx" ON "stock_lots" USING btree ("lot_number");
CREATE INDEX IF NOT EXISTS "stock_lots_purchase_date_idx" ON "stock_lots" USING btree ("purchase_date");
CREATE INDEX IF NOT EXISTS "stock_lots_expiry_idx" ON "stock_lots" USING btree ("expiry_date");
CREATE INDEX IF NOT EXISTS "stock_lots_status_idx" ON "stock_lots" USING btree ("status");
CREATE INDEX IF NOT EXISTS "stock_lots_purchase_order_line_idx" ON "stock_lots" USING btree ("purchase_order_line_id");
CREATE INDEX IF NOT EXISTS "stock_lots_status_expiry_idx" ON "stock_lots" USING btree ("status","expiry_date");
CREATE INDEX IF NOT EXISTS "stock_lots_variant_status_idx" ON "stock_lots" USING btree ("product_variant_id","status");
CREATE INDEX IF NOT EXISTS "stock_lots_warehouse_status_idx" ON "stock_lots" USING btree ("warehouse_id","status");

