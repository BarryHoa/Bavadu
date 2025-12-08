-- Migration: Create customer_companies table
-- Tạo bảng customer_companies (B2B customers)

-- ============================================
-- Customer Companies
-- ============================================
CREATE TABLE IF NOT EXISTS "customer_companies" (
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

-- ============================================
-- Foreign Keys
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customer_companies_payment_terms_id_payment_terms_id_fk'
  ) THEN
    ALTER TABLE "customer_companies" ADD CONSTRAINT "customer_companies_payment_terms_id_payment_terms_id_fk" 
      FOREIGN KEY ("payment_terms_id") REFERENCES "public"."payment_terms"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "customer_companies_code_idx" ON "customer_companies" USING btree ("code");
CREATE INDEX IF NOT EXISTS "customer_companies_name_idx" ON "customer_companies" USING btree ("name");
CREATE INDEX IF NOT EXISTS "customer_companies_tax_id_idx" ON "customer_companies" USING btree ("tax_id");
CREATE INDEX IF NOT EXISTS "customer_companies_active_idx" ON "customer_companies" USING btree ("is_active");

