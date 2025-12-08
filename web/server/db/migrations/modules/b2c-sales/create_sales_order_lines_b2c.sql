-- Migration: Create sales_order_lines_b2c table
-- Tạo bảng sales_order_lines_b2c

-- ============================================
-- B2C Sales Order Lines
-- ============================================
CREATE TABLE IF NOT EXISTS "sales_order_lines_b2c" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"description" varchar(256),
	"quantity_ordered" numeric(14, 2) DEFAULT '0' NOT NULL,
	"quantity_delivered" numeric(14, 2) DEFAULT '0' NOT NULL,
	"unit_price" numeric(14, 2) DEFAULT '0' NOT NULL,
	"line_discount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"line_tax" numeric(14, 2) DEFAULT '0' NOT NULL,
	"line_subtotal" numeric(14, 2) DEFAULT '0' NOT NULL,
	"line_total" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- ============================================
-- Foreign Keys
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_order_lines_b2c_order_id_sales_orders_b2c_id_fk'
  ) THEN
    ALTER TABLE "sales_order_lines_b2c" ADD CONSTRAINT "sales_order_lines_b2c_order_id_sales_orders_b2c_id_fk" 
      FOREIGN KEY ("order_id") REFERENCES "public"."sales_orders_b2c"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_order_lines_b2c_product_id_product_masters_id_fk'
  ) THEN
    ALTER TABLE "sales_order_lines_b2c" ADD CONSTRAINT "sales_order_lines_b2c_product_id_product_masters_id_fk" 
      FOREIGN KEY ("product_id") REFERENCES "public"."product_masters"("id") ON DELETE restrict ON UPDATE no action;
  END IF;
END $$;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "sales_order_lines_b2c_order_idx" ON "sales_order_lines_b2c" USING btree ("order_id");
CREATE INDEX IF NOT EXISTS "sales_order_lines_b2c_product_idx" ON "sales_order_lines_b2c" USING btree ("product_id");

