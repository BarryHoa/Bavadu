-- Migration: Create sales_orders_b2b table
-- Tạo bảng sales_orders_b2b

-- ============================================
-- B2B Sales Orders
-- ============================================
CREATE TABLE IF NOT EXISTS "sales_orders_b2b" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(64) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"company_name" varchar(256) NOT NULL,
	"tax_id" varchar(50),
	"contact_person" varchar(128),
	"contact_phone" varchar(20),
	"contact_email" varchar(255),
	"company_address" text,
	"payment_terms_id" uuid,
	"credit_limit" numeric(14, 2),
	"invoice_required" boolean DEFAULT true NOT NULL,
	"shipping_method_id" uuid,
	"shipping_terms_id" uuid,
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
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_orders_b2b_payment_terms_id_payment_terms_id_fk'
  ) THEN
    ALTER TABLE "sales_orders_b2b" ADD CONSTRAINT "sales_orders_b2b_payment_terms_id_payment_terms_id_fk" 
      FOREIGN KEY ("payment_terms_id") REFERENCES "public"."payment_terms"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_orders_b2b_shipping_method_id_shipping_methods_id_fk'
  ) THEN
    ALTER TABLE "sales_orders_b2b" ADD CONSTRAINT "sales_orders_b2b_shipping_method_id_shipping_methods_id_fk" 
      FOREIGN KEY ("shipping_method_id") REFERENCES "public"."shipping_methods"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_orders_b2b_shipping_terms_id_shipping_terms_id_fk'
  ) THEN
    ALTER TABLE "sales_orders_b2b" ADD CONSTRAINT "sales_orders_b2b_shipping_terms_id_shipping_terms_id_fk" 
      FOREIGN KEY ("shipping_terms_id") REFERENCES "public"."shipping_terms"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_orders_b2b_warehouse_id_stock_warehouses_id_fk'
  ) THEN
    ALTER TABLE "sales_orders_b2b" ADD CONSTRAINT "sales_orders_b2b_warehouse_id_stock_warehouses_id_fk" 
      FOREIGN KEY ("warehouse_id") REFERENCES "public"."stock_warehouses"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "sales_orders_b2b_code_idx" ON "sales_orders_b2b" USING btree ("code");
CREATE INDEX IF NOT EXISTS "sales_orders_b2b_company_idx" ON "sales_orders_b2b" USING btree ("company_name");
CREATE INDEX IF NOT EXISTS "sales_orders_b2b_status_idx" ON "sales_orders_b2b" USING btree ("status");
CREATE INDEX IF NOT EXISTS "sales_orders_b2b_warehouse_idx" ON "sales_orders_b2b" USING btree ("warehouse_id");
CREATE INDEX IF NOT EXISTS "sales_orders_b2b_expected_idx" ON "sales_orders_b2b" USING btree ("expected_date");
CREATE INDEX IF NOT EXISTS "sales_orders_b2b_created_idx" ON "sales_orders_b2b" USING btree ("created_at");

