-- Migration: Create sales_order_lines table (DEPRECATED - use sales_order_lines_b2b or sales_order_lines_b2c)
-- Tạo bảng sales_order_lines (DEPRECATED)

-- ============================================
-- Sales Order Lines (DEPRECATED)
-- ============================================
CREATE TABLE IF NOT EXISTS "sales_order_lines" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"description" varchar(256),
	"quantity_ordered" numeric(14, 2) DEFAULT '0' NOT NULL,
	"quantity_delivered" numeric(14, 2) DEFAULT '0' NOT NULL,
	"unit_price" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "sales_order_lines" ADD CONSTRAINT "sales_order_lines_order_id_sales_orders_id_fk" 
FOREIGN KEY ("order_id") REFERENCES "public"."sales_orders"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "sales_order_lines" ADD CONSTRAINT "sales_order_lines_product_id_product_masters_id_fk" 
FOREIGN KEY ("product_id") REFERENCES "public"."product_masters"("id") ON DELETE restrict ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "sales_order_lines_order_idx" ON "sales_order_lines" USING btree ("order_id");
CREATE INDEX IF NOT EXISTS "sales_order_lines_product_idx" ON "sales_order_lines" USING btree ("product_id");

