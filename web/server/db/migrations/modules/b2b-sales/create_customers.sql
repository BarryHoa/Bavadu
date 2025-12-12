-- Migration: Create customers table
-- Tạo bảng customers

CREATE TABLE "mdl_sale_b2b"."customers" (
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
