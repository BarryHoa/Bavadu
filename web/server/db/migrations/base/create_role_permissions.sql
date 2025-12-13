-- Migration: Create role_permissions table
-- Tạo bảng role_permissions để quản lý default permissions by role

CREATE TABLE "md_base"."role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"role_id" uuid NOT NULL REFERENCES "md_base"."roles"("id") ON DELETE CASCADE,
	"permission_key" varchar(100) NOT NULL,
	"permission_id" uuid REFERENCES "md_base"."permissions"("id") ON DELETE SET NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36),
	CONSTRAINT "role_permissions_role_key_unique" UNIQUE("role_id", "permission_key")
);

CREATE INDEX "role_permissions_role_idx" ON "md_base"."role_permissions"("role_id");
CREATE INDEX "role_permissions_key_idx" ON "md_base"."role_permissions"("permission_key");
CREATE INDEX "role_permissions_active_idx" ON "md_base"."role_permissions"("is_active");

