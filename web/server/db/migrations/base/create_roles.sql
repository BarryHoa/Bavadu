-- Migration: Create roles table in base schema
-- Tạo bảng roles trong base schema

CREATE TABLE "md_base"."roles" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL UNIQUE,
	"name" jsonb NOT NULL,
	"description" text,
	"permissions" jsonb NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

CREATE INDEX "roles_active_idx" ON "md_base"."roles"("is_active");

