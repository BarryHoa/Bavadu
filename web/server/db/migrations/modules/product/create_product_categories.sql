-- Migration: Create product_categories table
-- Tạo bảng product_categories

-- ============================================
-- Product Categories
-- ============================================
CREATE TABLE IF NOT EXISTS "product_categories" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"parent_id" uuid,
	"level" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "product_categories_code_unique" UNIQUE("code")
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_product_categories_id_fk" 
FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "product_categories_parent_idx" ON "product_categories" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "product_categories_active_idx" ON "product_categories" USING btree ("is_active");

