-- Migration: Create user_permission_overrides table
-- Tạo bảng user_permission_overrides để quản lý permission overrides cho user

CREATE TABLE "md_base"."user_permission_overrides" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "md_base"."users"("id") ON DELETE CASCADE,
	"granted_permissions" jsonb,
	"revoked_permissions" jsonb,
	"module" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

CREATE INDEX "user_permission_overrides_user_idx" ON "md_base"."user_permission_overrides"("user_id");
CREATE INDEX "user_permission_overrides_module_idx" ON "md_base"."user_permission_overrides"("module");
CREATE INDEX "user_permission_overrides_active_idx" ON "md_base"."user_permission_overrides"("is_active");
CREATE INDEX "user_permission_overrides_user_module_idx" ON "md_base"."user_permission_overrides"("user_id", "module");

