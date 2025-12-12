-- Migration: Create payment_terms table
-- Tạo bảng payment_terms với đầy đủ cột type, indexes và unique constraint

-- ============================================
-- Payment Terms
-- ============================================
CREATE TABLE IF NOT EXISTS "md_base"."payment_terms" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"type" varchar(50) NOT NULL DEFAULT 'all',
	"days" numeric(5, 0),
	"is_active" boolean DEFAULT true NOT NULL,
	"order" numeric(5, 0) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

COMMENT ON COLUMN "payment_terms"."type" IS 
'Loại payment term: b2c (chỉ dùng cho B2C), b2b (chỉ dùng cho B2B), all (dùng chung cho cả B2B và B2C)';

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "payment_terms_code_idx" ON "md_base"."payment_terms" USING btree ("code");
CREATE INDEX IF NOT EXISTS "payment_terms_active_idx" ON "md_base"."payment_terms" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "payment_terms_type_idx" ON "md_base"."payment_terms" USING btree ("type");
CREATE INDEX IF NOT EXISTS "payment_terms_type_active_idx" ON "md_base"."payment_terms" USING btree ("type", "is_active");

-- ============================================
-- Unique Constraint
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS "payment_terms_code_type_unique" 
ON "md_base"."payment_terms" USING btree ("code", "type");

COMMENT ON INDEX "payment_terms_code_type_unique" IS 
'Unique constraint: không được trùng code và type. Một code có thể tồn tại nhiều lần nhưng với các type khác nhau.';

