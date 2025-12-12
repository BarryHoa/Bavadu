-- Migration: Create dynamic_entities table
-- Tạo bảng dynamic_entities

-- ============================================
-- Dynamic Entities
-- ============================================
CREATE TABLE IF NOT EXISTS "md_base"."dynamic_entities" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"model" varchar(30) NOT NULL,
	"data_type" varchar(20) NOT NULL,
	"options" jsonb,
	"default_value" jsonb,
	"is_required" boolean DEFAULT false NOT NULL,
	"validation" jsonb,
	"use_in" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "md_base"."dynamic_entities" ADD CONSTRAINT "dynamic_entities_parent_id_dynamic_entities_id_fk" 
FOREIGN KEY ("parent_id") REFERENCES "md_base"."dynamic_entities"("id") ON DELETE no action ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "dynamic_entities_model_idx" ON "md_base"."dynamic_entities" USING btree ("model");
CREATE INDEX IF NOT EXISTS "dynamic_entities_parent_idx" ON "md_base"."dynamic_entities" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "dynamic_entities_active_idx" ON "md_base"."dynamic_entities" USING btree ("is_active");

