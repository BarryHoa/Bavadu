-- Migration: Create product_masters table
-- Tạo bảng product_masters

-- ============================================
-- Product Masters
-- ============================================
CREATE TABLE IF NOT EXISTS "product_masters" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"images" jsonb,
	"description" text,
	"type" varchar(20) NOT NULL,
	"features" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"brand" text,
	"category_id" uuid,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "product_masters_code_unique" UNIQUE("code")
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "product_masters" ADD CONSTRAINT "product_masters_category_id_product_categories_id_fk" 
FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "product_masters_category_idx" ON "product_masters" USING btree ("category_id");
CREATE INDEX IF NOT EXISTS "product_masters_type_idx" ON "product_masters" USING btree ("type");
CREATE INDEX IF NOT EXISTS "product_masters_active_idx" ON "product_masters" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "product_masters_type_active_idx" ON "product_masters" USING btree ("type","is_active");
CREATE INDEX IF NOT EXISTS "product_masters_category_active_idx" ON "product_masters" USING btree ("category_id","is_active");

