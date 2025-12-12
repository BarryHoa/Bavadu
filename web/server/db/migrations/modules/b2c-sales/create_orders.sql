-- Migration: Create orders table
-- Tạo bảng orders

CREATE TABLE "mdl_sale_b2c"."orders" (
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
	"price_list_id" uuid,
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
