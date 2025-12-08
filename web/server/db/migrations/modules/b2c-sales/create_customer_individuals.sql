-- Migration: Create customer_individuals table
-- Tạo bảng customer_individuals (B2C customers)

-- ============================================
-- Customer Individuals
-- ============================================
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

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "customer_individuals_code_idx" ON "customer_individuals" USING btree ("code");
CREATE INDEX IF NOT EXISTS "customer_individuals_name_idx" ON "customer_individuals" USING btree ("first_name","last_name");
CREATE INDEX IF NOT EXISTS "customer_individuals_phone_idx" ON "customer_individuals" USING btree ("phone");
CREATE INDEX IF NOT EXISTS "customer_individuals_email_idx" ON "customer_individuals" USING btree ("email");
CREATE INDEX IF NOT EXISTS "customer_individuals_active_idx" ON "customer_individuals" USING btree ("is_active");

