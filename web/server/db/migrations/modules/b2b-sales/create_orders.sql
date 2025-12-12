-- Migration: Create orders table
-- Tạo bảng orders

CREATE TABLE "mdl_sale_b2b"."orders" (
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
