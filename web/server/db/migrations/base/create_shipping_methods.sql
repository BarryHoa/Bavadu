-- Migration: Create shipping_methods table
-- Tạo bảng shipping_methods với đầy đủ cột type, indexes và unique constraint

-- ============================================
-- Shipping Methods
-- ============================================
CREATE TABLE IF NOT EXISTS "shipping_methods" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"type" varchar(50) NOT NULL DEFAULT 'all',
	"base_fee" numeric(14, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"order" numeric(5, 0) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

COMMENT ON COLUMN "shipping_methods"."type" IS 
'Loại shipping method: b2c (chỉ dùng cho B2C), b2b (chỉ dùng cho B2B), all (dùng chung cho cả B2B và B2C), b2b-internal (B2B nội bộ), b2b-external (B2B bên ngoài)';

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "shipping_methods_code_idx" ON "shipping_methods" USING btree ("code");
CREATE INDEX IF NOT EXISTS "shipping_methods_active_idx" ON "shipping_methods" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "shipping_methods_type_idx" ON "shipping_methods" USING btree ("type");
CREATE INDEX IF NOT EXISTS "shipping_methods_type_active_idx" ON "shipping_methods" USING btree ("type", "is_active");

-- ============================================
-- Unique Constraint
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS "shipping_methods_code_type_unique" 
ON "shipping_methods" USING btree ("code", "type");

COMMENT ON INDEX "shipping_methods_code_type_unique" IS 
'Unique constraint: không được trùng code và type. Một code có thể tồn tại nhiều lần nhưng với các type khác nhau.';

