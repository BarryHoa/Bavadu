-- Migration: Price Lists B2C
-- Creates tables for B2C pricing system: 1 SO = 1 Price List + Rules/Promotions + Manual Override

-- ============================================
-- 1. Price Lists (Bảng giá)
-- ============================================
CREATE TABLE IF NOT EXISTS "price_lists_b2c" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
  "code" varchar(64) NOT NULL UNIQUE,
  "name" jsonb NOT NULL,
  "description" text,
  "type" varchar(20) DEFAULT 'standard' NOT NULL,
  "status" varchar(20) DEFAULT 'active' NOT NULL,
  "priority" integer DEFAULT 0 NOT NULL,
  "currency_id" uuid,
  "valid_from" timestamp with time zone,
  "valid_to" timestamp with time zone,
  "is_default" boolean DEFAULT false NOT NULL,
  "applicable_to" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "created_by" varchar(36),
  "updated_by" varchar(36)
);

CREATE INDEX "idx_price_lists_b2c_code" ON "price_lists_b2c"("code");
CREATE INDEX "idx_price_lists_b2c_status" ON "price_lists_b2c"("status");
CREATE INDEX "idx_price_lists_b2c_type" ON "price_lists_b2c"("type");
CREATE INDEX "idx_price_lists_b2c_valid_dates" ON "price_lists_b2c"("valid_from", "valid_to");
CREATE INDEX "idx_price_lists_b2c_default" ON "price_lists_b2c"("is_default") WHERE "is_default" = true;

-- ============================================
-- 2. Price List Items (Chi tiết giá)
-- ============================================
CREATE TABLE IF NOT EXISTS "price_list_items_b2c" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
  "price_list_id" uuid NOT NULL REFERENCES "price_lists_b2c"("id") ON DELETE CASCADE,
  "product_variant_id" uuid NOT NULL REFERENCES "product_variants"("id") ON DELETE RESTRICT,
  "product_master_id" uuid NOT NULL REFERENCES "product_masters"("id") ON DELETE RESTRICT,
  "pricing_type" varchar(20) DEFAULT 'fixed' NOT NULL,
  "base_price" numeric(18, 4),
  "sale_price" numeric(18, 4),
  "discount_type" varchar(20),
  "discount_value" numeric(18, 4),
  "final_price" numeric(18, 4),
  "min_quantity" numeric(14, 2) DEFAULT 1 NOT NULL,
  "max_quantity" numeric(14, 2),
  "uom_id" uuid,
  "tax_included" boolean DEFAULT false NOT NULL,
  "tax_rate_id" uuid,
  "valid_from" timestamp with time zone,
  "valid_to" timestamp with time zone,
  "is_active" boolean DEFAULT true NOT NULL,
  "priority" integer DEFAULT 0 NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

CREATE INDEX "idx_price_list_items_b2c_price_list" ON "price_list_items_b2c"("price_list_id");
CREATE INDEX "idx_price_list_items_b2c_product_variant" ON "price_list_items_b2c"("product_variant_id");
CREATE INDEX "idx_price_list_items_b2c_product_master" ON "price_list_items_b2c"("product_master_id");
CREATE INDEX "idx_price_list_items_b2c_active" ON "price_list_items_b2c"("is_active") WHERE "is_active" = true;
CREATE INDEX "idx_price_list_items_b2c_valid_dates" ON "price_list_items_b2c"("valid_from", "valid_to");
CREATE INDEX "idx_price_list_items_b2c_lookup" ON "price_list_items_b2c"("product_variant_id", "price_list_id", "is_active");

-- ============================================
-- 3. Pricing Rules (Quy tắc định giá)
-- ============================================
CREATE TABLE IF NOT EXISTS "pricing_rules_b2c" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
  "price_list_id" uuid NOT NULL REFERENCES "price_lists_b2c"("id") ON DELETE CASCADE,
  "conditions" jsonb NOT NULL,
  "pricing_method" varchar(20) NOT NULL,
  "fixed_price" numeric(18, 4),
  "discount_type" varchar(20),
  "discount_value" numeric(18, 4),
  "formula" text,
  "min_quantity" numeric(14, 2) DEFAULT 1 NOT NULL,
  "max_quantity" numeric(14, 2),
  "priority" integer DEFAULT 0 NOT NULL,
  "valid_from" timestamp with time zone,
  "valid_to" timestamp with time zone,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

CREATE INDEX "idx_pricing_rules_b2c_price_list" ON "pricing_rules_b2c"("price_list_id");
CREATE INDEX "idx_pricing_rules_b2c_active" ON "pricing_rules_b2c"("is_active") WHERE "is_active" = true;
CREATE INDEX "idx_pricing_rules_b2c_priority" ON "pricing_rules_b2c"("price_list_id", "priority");

-- ============================================
-- 4. Price Tiers (Giá theo bậc)
-- ============================================
CREATE TABLE IF NOT EXISTS "price_tiers_b2c" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
  "price_list_item_id" uuid REFERENCES "price_list_items_b2c"("id") ON DELETE CASCADE,
  "pricing_rule_id" uuid REFERENCES "pricing_rules_b2c"("id") ON DELETE CASCADE,
  "min_quantity" numeric(14, 2) NOT NULL,
  "max_quantity" numeric(14, 2),
  "price" numeric(18, 4) NOT NULL,
  "discount_percentage" numeric(5, 2),
  "priority" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "price_tiers_b2c_source_check" CHECK (
    ("price_list_item_id" IS NOT NULL AND "pricing_rule_id" IS NULL) OR
    ("price_list_item_id" IS NULL AND "pricing_rule_id" IS NOT NULL)
  )
);

CREATE INDEX "idx_price_tiers_b2c_item" ON "price_tiers_b2c"("price_list_item_id");
CREATE INDEX "idx_price_tiers_b2c_rule" ON "price_tiers_b2c"("pricing_rule_id");
CREATE INDEX "idx_price_tiers_b2c_quantity" ON "price_tiers_b2c"("min_quantity", "max_quantity");

-- ============================================
-- 5. Update Sales Orders B2C
-- ============================================
ALTER TABLE "sales_orders_b2c" 
ADD COLUMN IF NOT EXISTS "price_list_id" uuid REFERENCES "price_lists_b2c"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "idx_sales_orders_b2c_price_list" ON "sales_orders_b2c"("price_list_id");

-- ============================================
-- 6. Update Sales Order Lines B2C
-- ============================================
ALTER TABLE "sales_order_lines_b2c"
ADD COLUMN IF NOT EXISTS "price_source" varchar(20) DEFAULT 'price_list' NOT NULL,
ADD COLUMN IF NOT EXISTS "price_list_item_id" uuid,
ADD COLUMN IF NOT EXISTS "pricing_rule_id" uuid,
ADD COLUMN IF NOT EXISTS "base_price" numeric(18, 4),
ADD COLUMN IF NOT EXISTS "original_unit_price" numeric(18, 4);

CREATE INDEX IF NOT EXISTS "idx_sales_order_lines_b2c_price_source" ON "sales_order_lines_b2c"("price_source");

