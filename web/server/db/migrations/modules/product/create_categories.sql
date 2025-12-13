-- Migration: Create categories table
-- Tạo bảng categories

CREATE TABLE "mdl_product"."categories" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"description" text,
	"parent_id" uuid,
	"level" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "categories_code_unique" UNIQUE("code")
);

-- Add foreign key constraint for self-referencing parent_id
ALTER TABLE "mdl_product"."categories"
	ADD CONSTRAINT "categories_parent_id_categories_id_fk"
	FOREIGN KEY ("parent_id") 
	REFERENCES "mdl_product"."categories"("id") 
	ON DELETE NO ACTION;

-- Add indexes
CREATE INDEX IF NOT EXISTS "categories_parent_idx" ON "mdl_product"."categories"("parent_id");
CREATE INDEX IF NOT EXISTS "categories_active_idx" ON "mdl_product"."categories"("is_active");
