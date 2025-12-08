-- Migration: Create sales_order_deliveries table
-- Tạo bảng sales_order_deliveries (dùng chung cho cả B2B và B2C)

-- ============================================
-- Sales Order Deliveries
-- ============================================
CREATE TABLE IF NOT EXISTS "sales_order_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"order_type" varchar(10) NOT NULL,
	"order_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"delivery_date" timestamp with time zone NOT NULL,
	"reference" varchar(128),
	"note" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36)
);

-- ============================================
-- Foreign Keys
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_order_deliveries_warehouse_id_stock_warehouses_id_fk'
  ) THEN
    ALTER TABLE "sales_order_deliveries" ADD CONSTRAINT "sales_order_deliveries_warehouse_id_stock_warehouses_id_fk" 
      FOREIGN KEY ("warehouse_id") REFERENCES "public"."stock_warehouses"("id") ON DELETE restrict ON UPDATE no action;
  END IF;
END $$;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "sales_order_deliveries_order_idx" ON "sales_order_deliveries" USING btree ("order_type","order_id");
CREATE INDEX IF NOT EXISTS "sales_order_deliveries_warehouse_idx" ON "sales_order_deliveries" USING btree ("warehouse_id");
CREATE INDEX IF NOT EXISTS "sales_order_deliveries_date_idx" ON "sales_order_deliveries" USING btree ("delivery_date");
CREATE INDEX IF NOT EXISTS "sales_order_deliveries_status_idx" ON "sales_order_deliveries" USING btree ("status");

