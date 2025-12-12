-- Migration: Create currency_rates table
-- Tạo bảng currency_rates

CREATE TABLE "mdl_sale_b2b"."currency_rates" (
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
