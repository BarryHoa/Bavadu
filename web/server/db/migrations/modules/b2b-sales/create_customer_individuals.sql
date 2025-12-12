-- Migration: Create customer_individuals table
-- Tạo bảng customer_individuals

CREATE TABLE "mdl_sale_b2b"."customer_individuals" (
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
