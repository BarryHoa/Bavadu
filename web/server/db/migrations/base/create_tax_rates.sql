-- Migration: Create tax_rates table
-- Tạo bảng tax_rates với đầy đủ cột type, indexes và unique constraint

-- ============================================
-- Tax Rates
-- ============================================
CREATE TABLE IF NOT EXISTS "md_base"."tax_rates" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" jsonb NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL DEFAULT 'all',
	"rate" numeric(5, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"order" numeric(5, 0) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

COMMENT ON COLUMN "md_base"."tax_rates"."type" IS 
'Loại tax rate: b2c (chỉ dùng cho B2C), b2b (chỉ dùng cho B2B), all (dùng chung cho cả B2B và B2C)';

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "tax_rates_code_idx" ON "md_base"."tax_rates" USING btree ("code");
CREATE INDEX IF NOT EXISTS "tax_rates_active_idx" ON "md_base"."tax_rates" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "tax_rates_type_idx" ON "md_base"."tax_rates" USING btree ("type");
CREATE INDEX IF NOT EXISTS "tax_rates_type_active_idx" ON "md_base"."tax_rates" USING btree ("type", "is_active");

-- ============================================
-- Unique Constraint
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS "tax_rates_code_type_unique" 
ON "md_base"."tax_rates" USING btree ("code", "type");

COMMENT ON INDEX "tax_rates_code_type_unique" IS 
'Unique constraint: không được trùng code và type. Một code có thể tồn tại nhiều lần nhưng với các type khác nhau.';

