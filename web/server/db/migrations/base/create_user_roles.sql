-- Migration: Create user_roles table in base schema
-- Tạo bảng user_roles trong base schema

CREATE TABLE "md_base"."user_roles" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "md_base"."users"("id") ON DELETE CASCADE,
	"role_id" uuid NOT NULL REFERENCES "md_base"."roles"("id") ON DELETE CASCADE,
	"scope" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now(),
	"assigned_by" varchar(36),
	"revoked_at" timestamp with time zone,
	"revoked_by" varchar(36),
	CONSTRAINT "user_roles_user_role_unique" UNIQUE("user_id", "role_id")
);

CREATE INDEX "user_roles_user_idx" ON "md_base"."user_roles"("user_id");
CREATE INDEX "user_roles_role_idx" ON "md_base"."user_roles"("role_id");
CREATE INDEX "user_roles_active_idx" ON "md_base"."user_roles"("is_active");

