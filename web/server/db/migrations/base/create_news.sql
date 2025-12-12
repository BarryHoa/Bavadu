-- Migration: Create news table
-- Tạo bảng news

-- ============================================
-- News
-- ============================================
CREATE TABLE IF NOT EXISTS "md_base"."news" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"author_id" uuid NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"image_url" varchar(512),
	"tags" varchar(255)[],
	"view_count" varchar(20) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "news_author_id_idx" ON "md_base"."news" USING btree ("author_id");
CREATE INDEX IF NOT EXISTS "news_published_idx" ON "md_base"."news" USING btree ("is_published","published_at");
CREATE INDEX IF NOT EXISTS "news_created_at_idx" ON "md_base"."news" USING btree ("created_at");

