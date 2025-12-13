-- Migration: Create role_permissions table
-- Tạo bảng role_permissions để quản lý permission overrides cho role
-- Refactored from user_permission_overrides to role_permissions

CREATE TABLE "md_base"."role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"role_id" uuid NOT NULL REFERENCES "md_base"."roles"("id") ON DELETE CASCADE,
	"granted_permissions" jsonb,
	"revoked_permissions" jsonb,
	"module" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

CREATE INDEX "role_permissions_role_idx" ON "md_base"."role_permissions"("role_id");
CREATE INDEX "role_permissions_module_idx" ON "md_base"."role_permissions"("module");
CREATE INDEX "role_permissions_active_idx" ON "md_base"."role_permissions"("is_active");
CREATE INDEX "role_permissions_role_module_idx" ON "md_base"."role_permissions"("role_id", "module");
