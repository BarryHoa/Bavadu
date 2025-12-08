-- Migration: Create sales_orders_b2c table
-- Tạo bảng sales_orders_b2c

-- ============================================
-- B2C Sales Orders
-- ============================================
CREATE TABLE IF NOT EXISTS "sales_orders_b2c" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(64) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"customer_name" varchar(128) NOT NULL,
	"customer_phone" varchar(20),
	"customer_email" varchar(255),
	"delivery_address" text,
	"payment_method_id" uuid,
	"shipping_method_id" uuid,
	"shipping_terms_id" uuid,
	"require_invoice" boolean DEFAULT false NOT NULL,
	"warehouse_id" uuid,
	"expected_date" timestamp with time zone,
	"subtotal" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total_discount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total_tax" numeric(14, 2) DEFAULT '0' NOT NULL,
	"shipping_fee" numeric(14, 2) DEFAULT '0' NOT NULL,
	"grand_total" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"currency" varchar(8) DEFAULT 'USD',
	"currency_rate" numeric(14, 6),
	"completed_at" timestamp with time zone,
	"notes" text,
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
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_orders_b2c_payment_method_id_payment_methods_id_fk'
  ) THEN
    ALTER TABLE "sales_orders_b2c" ADD CONSTRAINT "sales_orders_b2c_payment_method_id_payment_methods_id_fk" 
      FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_orders_b2c_shipping_method_id_shipping_methods_id_fk'
  ) THEN
    ALTER TABLE "sales_orders_b2c" ADD CONSTRAINT "sales_orders_b2c_shipping_method_id_shipping_methods_id_fk" 
      FOREIGN KEY ("shipping_method_id") REFERENCES "public"."shipping_methods"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_orders_b2c_shipping_terms_id_shipping_terms_id_fk'
  ) THEN
    ALTER TABLE "sales_orders_b2c" ADD CONSTRAINT "sales_orders_b2c_shipping_terms_id_shipping_terms_id_fk" 
      FOREIGN KEY ("shipping_terms_id") REFERENCES "public"."shipping_terms"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_orders_b2c_warehouse_id_stock_warehouses_id_fk'
  ) THEN
    ALTER TABLE "sales_orders_b2c" ADD CONSTRAINT "sales_orders_b2c_warehouse_id_stock_warehouses_id_fk" 
      FOREIGN KEY ("warehouse_id") REFERENCES "public"."stock_warehouses"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "sales_orders_b2c_code_idx" ON "sales_orders_b2c" USING btree ("code");
CREATE INDEX IF NOT EXISTS "sales_orders_b2c_customer_idx" ON "sales_orders_b2c" USING btree ("customer_name");
CREATE INDEX IF NOT EXISTS "sales_orders_b2c_status_idx" ON "sales_orders_b2c" USING btree ("status");
CREATE INDEX IF NOT EXISTS "sales_orders_b2c_warehouse_idx" ON "sales_orders_b2c" USING btree ("warehouse_id");
CREATE INDEX IF NOT EXISTS "sales_orders_b2c_expected_idx" ON "sales_orders_b2c" USING btree ("expected_date");
CREATE INDEX IF NOT EXISTS "sales_orders_b2c_created_idx" ON "sales_orders_b2c" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "sales_orders_b2c_completed_idx" ON "sales_orders_b2c" USING btree ("completed_at");

