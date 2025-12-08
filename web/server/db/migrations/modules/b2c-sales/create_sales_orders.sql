-- Migration: Create sales_orders table (DEPRECATED - use sales_orders_b2b or sales_orders_b2c)
-- Tạo bảng sales_orders (DEPRECATED)

-- ============================================
-- Sales Orders (DEPRECATED)
-- ============================================
CREATE TABLE IF NOT EXISTS "sales_orders" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(64) NOT NULL,
	"customer_name" varchar(128) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"warehouse_id" uuid,
	"expected_date" timestamp with time zone,
	"total_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"currency" varchar(8) DEFAULT 'USD',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36)
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_warehouse_id_stock_warehouses_id_fk" 
FOREIGN KEY ("warehouse_id") REFERENCES "public"."stock_warehouses"("id") ON DELETE set null ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "sales_orders_code_idx" ON "sales_orders" USING btree ("code");
CREATE INDEX IF NOT EXISTS "sales_orders_customer_idx" ON "sales_orders" USING btree ("customer_name");
CREATE INDEX IF NOT EXISTS "sales_orders_status_idx" ON "sales_orders" USING btree ("status");
CREATE INDEX IF NOT EXISTS "sales_orders_warehouse_idx" ON "sales_orders" USING btree ("warehouse_id");
CREATE INDEX IF NOT EXISTS "sales_orders_expected_idx" ON "sales_orders" USING btree ("expected_date");
CREATE INDEX IF NOT EXISTS "sales_orders_created_idx" ON "sales_orders" USING btree ("created_at");

