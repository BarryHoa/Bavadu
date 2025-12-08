-- Migration: Create order_currency_rates table
-- Tạo bảng order_currency_rates (dùng chung cho cả B2B và B2C)

-- ============================================
-- Order Currency Rates
-- ============================================
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

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "order_currency_rates_order_idx" ON "order_currency_rates" USING btree ("order_type","order_id");
CREATE INDEX IF NOT EXISTS "order_currency_rates_currency_idx" ON "order_currency_rates" USING btree ("currency_code");
CREATE INDEX IF NOT EXISTS "order_currency_rates_date_idx" ON "order_currency_rates" USING btree ("rate_date");

