-- Migration for Sales Order B2B/B2C and related tables
-- Only creates new tables, skips existing ones

-- B2B Sales Orders
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

-- B2B Sales Order Lines
CREATE TABLE IF NOT EXISTS "sales_order_lines_b2b" (
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

-- B2C Sales Orders
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

-- B2C Sales Order Lines
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

-- Customer Companies
CREATE TABLE IF NOT EXISTS "customer_companies" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(64) NOT NULL,
	"name" varchar(256) NOT NULL,
	"tax_id" varchar(50),
	"address" text,
	"phone" varchar(20),
	"email" varchar(255),
	"website" varchar(255),
	"contact_person" varchar(128),
	"credit_limit" numeric(14, 2),
	"payment_terms_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

-- Customer Individuals
CREATE TABLE IF NOT EXISTS "customer_individuals" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(64) NOT NULL,
	"first_name" varchar(128) NOT NULL,
	"last_name" varchar(128) NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"address" text,
	"date_of_birth" timestamp with time zone,
	"gender" varchar(10),
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

-- Payment Methods
CREATE TABLE IF NOT EXISTS "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"order" numeric(5, 0) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- Payment Terms
CREATE TABLE IF NOT EXISTS "payment_terms" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"days" numeric(5, 0),
	"is_active" boolean DEFAULT true NOT NULL,
	"order" numeric(5, 0) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- Shipping Methods
CREATE TABLE IF NOT EXISTS "shipping_methods" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"base_fee" numeric(14, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"order" numeric(5, 0) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- Shipping Terms
CREATE TABLE IF NOT EXISTS "shipping_terms" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"order" numeric(5, 0) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- Tax Rates
CREATE TABLE IF NOT EXISTS "tax_rates" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"rate" numeric(5, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"order" numeric(5, 0) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- Order Currency Rates
CREATE TABLE IF NOT EXISTS "order_currency_rates" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"order_type" varchar(10) NOT NULL,
	"order_id" uuid NOT NULL,
	"currency_code" varchar(8) NOT NULL,
	"exchange_rate" numeric(14, 6) NOT NULL,
	"rate_date" timestamp with time zone NOT NULL,
	"source" varchar(50),
	"note" varchar(256),
	"created_at" timestamp with time zone DEFAULT now()
);

-- Sales Order Deliveries
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

-- Sales Order Delivery Lines
CREATE TABLE IF NOT EXISTS "sales_order_delivery_lines" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"delivery_id" uuid NOT NULL,
	"order_type" varchar(10) NOT NULL,
	"order_line_id" uuid NOT NULL,
	"quantity" numeric(14, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);

-- Foreign Keys
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

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_order_lines_b2b_order_id_sales_orders_b2b_id_fk'
  ) THEN
    ALTER TABLE "sales_order_lines_b2b" ADD CONSTRAINT "sales_order_lines_b2b_order_id_sales_orders_b2b_id_fk" 
      FOREIGN KEY ("order_id") REFERENCES "public"."sales_orders_b2b"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_order_lines_b2b_product_id_product_masters_id_fk'
  ) THEN
    ALTER TABLE "sales_order_lines_b2b" ADD CONSTRAINT "sales_order_lines_b2b_product_id_product_masters_id_fk" 
      FOREIGN KEY ("product_id") REFERENCES "public"."product_masters"("id") ON DELETE restrict ON UPDATE no action;
  END IF;
END $$;

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

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customer_companies_payment_terms_id_payment_terms_id_fk'
  ) THEN
    ALTER TABLE "customer_companies" ADD CONSTRAINT "customer_companies_payment_terms_id_payment_terms_id_fk" 
      FOREIGN KEY ("payment_terms_id") REFERENCES "public"."payment_terms"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_order_deliveries_warehouse_id_stock_warehouses_id_fk'
  ) THEN
    ALTER TABLE "sales_order_deliveries" ADD CONSTRAINT "sales_order_deliveries_warehouse_id_stock_warehouses_id_fk" 
      FOREIGN KEY ("warehouse_id") REFERENCES "public"."stock_warehouses"("id") ON DELETE restrict ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_order_delivery_lines_delivery_id_sales_order_deliveries_id_fk'
  ) THEN
    ALTER TABLE "sales_order_delivery_lines" ADD CONSTRAINT "sales_order_delivery_lines_delivery_id_sales_order_deliveries_id_fk" 
      FOREIGN KEY ("delivery_id") REFERENCES "public"."sales_order_deliveries"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS "sales_orders_b2b_code_idx" ON "sales_orders_b2b" USING btree ("code");
CREATE INDEX IF NOT EXISTS "sales_orders_b2b_company_idx" ON "sales_orders_b2b" USING btree ("company_name");
CREATE INDEX IF NOT EXISTS "sales_orders_b2b_status_idx" ON "sales_orders_b2b" USING btree ("status");
CREATE INDEX IF NOT EXISTS "sales_orders_b2b_warehouse_idx" ON "sales_orders_b2b" USING btree ("warehouse_id");
CREATE INDEX IF NOT EXISTS "sales_orders_b2b_expected_idx" ON "sales_orders_b2b" USING btree ("expected_date");
CREATE INDEX IF NOT EXISTS "sales_orders_b2b_created_idx" ON "sales_orders_b2b" USING btree ("created_at");

CREATE INDEX IF NOT EXISTS "sales_order_lines_b2b_order_idx" ON "sales_order_lines_b2b" USING btree ("order_id");
CREATE INDEX IF NOT EXISTS "sales_order_lines_b2b_product_idx" ON "sales_order_lines_b2b" USING btree ("product_id");

CREATE INDEX IF NOT EXISTS "sales_orders_b2c_code_idx" ON "sales_orders_b2c" USING btree ("code");
CREATE INDEX IF NOT EXISTS "sales_orders_b2c_customer_idx" ON "sales_orders_b2c" USING btree ("customer_name");
CREATE INDEX IF NOT EXISTS "sales_orders_b2c_status_idx" ON "sales_orders_b2c" USING btree ("status");
CREATE INDEX IF NOT EXISTS "sales_orders_b2c_warehouse_idx" ON "sales_orders_b2c" USING btree ("warehouse_id");
CREATE INDEX IF NOT EXISTS "sales_orders_b2c_expected_idx" ON "sales_orders_b2c" USING btree ("expected_date");
CREATE INDEX IF NOT EXISTS "sales_orders_b2c_created_idx" ON "sales_orders_b2c" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "sales_orders_b2c_completed_idx" ON "sales_orders_b2c" USING btree ("completed_at");

CREATE INDEX IF NOT EXISTS "sales_order_lines_b2c_order_idx" ON "sales_order_lines_b2c" USING btree ("order_id");
CREATE INDEX IF NOT EXISTS "sales_order_lines_b2c_product_idx" ON "sales_order_lines_b2c" USING btree ("product_id");

CREATE INDEX IF NOT EXISTS "customer_companies_code_idx" ON "customer_companies" USING btree ("code");
CREATE INDEX IF NOT EXISTS "customer_companies_name_idx" ON "customer_companies" USING btree ("name");
CREATE INDEX IF NOT EXISTS "customer_companies_tax_id_idx" ON "customer_companies" USING btree ("tax_id");
CREATE INDEX IF NOT EXISTS "customer_companies_active_idx" ON "customer_companies" USING btree ("is_active");

CREATE INDEX IF NOT EXISTS "customer_individuals_code_idx" ON "customer_individuals" USING btree ("code");
CREATE INDEX IF NOT EXISTS "customer_individuals_name_idx" ON "customer_individuals" USING btree ("first_name","last_name");
CREATE INDEX IF NOT EXISTS "customer_individuals_phone_idx" ON "customer_individuals" USING btree ("phone");
CREATE INDEX IF NOT EXISTS "customer_individuals_email_idx" ON "customer_individuals" USING btree ("email");
CREATE INDEX IF NOT EXISTS "customer_individuals_active_idx" ON "customer_individuals" USING btree ("is_active");

CREATE INDEX IF NOT EXISTS "payment_methods_code_idx" ON "payment_methods" USING btree ("code");
CREATE INDEX IF NOT EXISTS "payment_methods_active_idx" ON "payment_methods" USING btree ("is_active");

CREATE INDEX IF NOT EXISTS "payment_terms_code_idx" ON "payment_terms" USING btree ("code");
CREATE INDEX IF NOT EXISTS "payment_terms_active_idx" ON "payment_terms" USING btree ("is_active");

CREATE INDEX IF NOT EXISTS "shipping_methods_code_idx" ON "shipping_methods" USING btree ("code");
CREATE INDEX IF NOT EXISTS "shipping_methods_active_idx" ON "shipping_methods" USING btree ("is_active");

CREATE INDEX IF NOT EXISTS "shipping_terms_code_idx" ON "shipping_terms" USING btree ("code");
CREATE INDEX IF NOT EXISTS "shipping_terms_active_idx" ON "shipping_terms" USING btree ("is_active");

CREATE INDEX IF NOT EXISTS "tax_rates_code_idx" ON "tax_rates" USING btree ("code");
CREATE INDEX IF NOT EXISTS "tax_rates_active_idx" ON "tax_rates" USING btree ("is_active");

CREATE INDEX IF NOT EXISTS "order_currency_rates_order_idx" ON "order_currency_rates" USING btree ("order_type","order_id");
CREATE INDEX IF NOT EXISTS "order_currency_rates_currency_idx" ON "order_currency_rates" USING btree ("currency_code");
CREATE INDEX IF NOT EXISTS "order_currency_rates_date_idx" ON "order_currency_rates" USING btree ("rate_date");

CREATE INDEX IF NOT EXISTS "sales_order_deliveries_order_idx" ON "sales_order_deliveries" USING btree ("order_type","order_id");
CREATE INDEX IF NOT EXISTS "sales_order_deliveries_warehouse_idx" ON "sales_order_deliveries" USING btree ("warehouse_id");
CREATE INDEX IF NOT EXISTS "sales_order_deliveries_date_idx" ON "sales_order_deliveries" USING btree ("delivery_date");
CREATE INDEX IF NOT EXISTS "sales_order_deliveries_status_idx" ON "sales_order_deliveries" USING btree ("status");

CREATE INDEX IF NOT EXISTS "sales_order_delivery_lines_delivery_idx" ON "sales_order_delivery_lines" USING btree ("delivery_id");
CREATE INDEX IF NOT EXISTS "sales_order_delivery_lines_order_line_idx" ON "sales_order_delivery_lines" USING btree ("order_type","order_line_id");

