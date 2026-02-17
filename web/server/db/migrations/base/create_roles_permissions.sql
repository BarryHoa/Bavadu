-- Migration: Create new roles and permissions structure
-- Tạo cấu trúc mới cho roles và permissions

-- ============================================
-- Drop old tables if they exist
-- ============================================
DROP TABLE IF EXISTS "md_base"."user_permissions" CASCADE;
DROP TABLE IF EXISTS "md_base"."user_roles" CASCADE;
DROP TABLE IF EXISTS "md_base"."role_permissions" CASCADE;
DROP TABLE IF EXISTS "md_base"."role_permissions_default" CASCADE;
DROP TABLE IF EXISTS "md_base"."roles" CASCADE;
DROP TABLE IF EXISTS "md_base"."permissions" CASCADE;

-- ============================================
-- 1. Roles Table - Định nghĩa các roles
-- ============================================
CREATE TABLE "md_base"."roles" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL UNIQUE,
	"name" jsonb NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_admin_modules" jsonb NOT NULL DEFAULT '{}'::jsonb,Ư
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

CREATE INDEX "roles_active_idx" ON "md_base"."roles"("is_active");
CREATE INDEX "roles_code_idx" ON "md_base"."roles"("code");

-- ============================================
-- 2. Permissions Table - Định nghĩa các permissions
-- ============================================
CREATE TABLE "md_base"."permissions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"key" varchar(100) NOT NULL UNIQUE,
	"module" varchar(50) NOT NULL,
	"resource" varchar(50) NOT NULL,
	"action" varchar(50) NOT NULL,
	"name" jsonb NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);

CREATE INDEX "permissions_module_idx" ON "md_base"."permissions"("module");
CREATE INDEX "permissions_key_idx" ON "md_base"."permissions"("key");
CREATE INDEX "permissions_active_idx" ON "md_base"."permissions"("is_active");
CREATE UNIQUE INDEX "permissions_key_unique_idx" ON "md_base"."permissions"("key");

-- ============================================
-- 3. Role Permissions Default - Default permissions cho mỗi role
-- ============================================
CREATE TABLE "md_base"."role_permissions_default" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"role_id" uuid NOT NULL REFERENCES "md_base"."roles"("id") ON DELETE CASCADE,
	"permission_id" uuid NOT NULL REFERENCES "md_base"."permissions"("id") ON DELETE CASCADE,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36)
);

CREATE UNIQUE INDEX "role_permissions_default_role_permission_idx" ON "md_base"."role_permissions_default"("role_id", "permission_id");
CREATE INDEX "role_permissions_default_role_idx" ON "md_base"."role_permissions_default"("role_id");
CREATE INDEX "role_permissions_default_permission_idx" ON "md_base"."role_permissions_default"("permission_id");
CREATE INDEX "role_permissions_default_active_idx" ON "md_base"."role_permissions_default"("is_active");

-- ============================================
-- 4. User Roles - Roles của mỗi user
-- ============================================
CREATE TABLE "md_base"."user_roles" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "md_base"."users"("id") ON DELETE CASCADE,
	"role_id" uuid NOT NULL REFERENCES "md_base"."roles"("id") ON DELETE CASCADE,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36)
);

CREATE UNIQUE INDEX "user_roles_user_role_idx" ON "md_base"."user_roles"("user_id", "role_id");
CREATE INDEX "user_roles_user_idx" ON "md_base"."user_roles"("user_id");
CREATE INDEX "user_roles_role_idx" ON "md_base"."user_roles"("role_id");
CREATE INDEX "user_roles_active_idx" ON "md_base"."user_roles"("is_active");

-- ============================================
-- 5. User Permissions - Permissions bổ sung cho user (ngoài permissions từ roles)
-- ============================================
CREATE TABLE "md_base"."user_permissions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "md_base"."users"("id") ON DELETE CASCADE,
	"permission_id" uuid NOT NULL REFERENCES "md_base"."permissions"("id") ON DELETE CASCADE,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36)
);

CREATE UNIQUE INDEX "user_permissions_user_permission_idx" ON "md_base"."user_permissions"("user_id", "permission_id");
CREATE INDEX "user_permissions_user_idx" ON "md_base"."user_permissions"("user_id");
CREATE INDEX "user_permissions_permission_idx" ON "md_base"."user_permissions"("permission_id");
CREATE INDEX "user_permissions_active_idx" ON "md_base"."user_permissions"("is_active");

