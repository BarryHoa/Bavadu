-- Migration: Create sales_order_delivery_lines table
-- Tạo bảng sales_order_delivery_lines (dùng chung cho cả B2B và B2C)

-- ============================================
-- Sales Order Delivery Lines
-- ============================================
CREATE TABLE IF NOT EXISTS "md_base"."delivery_lines" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"delivery_id" uuid NOT NULL,
	"order_type" varchar(10) NOT NULL,
	"order_line_id" uuid NOT NULL,
	"quantity" numeric(14, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);

-- ============================================
-- Foreign Keys
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_order_delivery_lines_delivery_id_sales_order_deliveries_id_fk'
  ) THEN
    ALTER TABLE "md_base"."delivery_lines" ADD CONSTRAINT "sales_order_delivery_lines_delivery_id_sales_order_deliveries_id_fk" 
      FOREIGN KEY ("delivery_id") REFERENCES "md_base"."deliveries"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "sales_order_delivery_lines_delivery_idx" ON "md_base"."delivery_lines" USING btree ("delivery_id");
CREATE INDEX IF NOT EXISTS "sales_order_delivery_lines_order_line_idx" ON "md_base"."delivery_lines" USING btree ("order_type","order_line_id");

