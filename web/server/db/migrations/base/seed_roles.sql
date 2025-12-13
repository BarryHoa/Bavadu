-- Migration: Seed default system roles
-- Tạo các role mặc định của hệ thống

-- Guest Role - Khách (no permissions)
INSERT INTO "md_base"."roles" (
	"id", "code", "name", "description", 
	"is_system", "is_active",
	"created_at", "updated_at"
) VALUES (
	'00000000-0000-0000-0000-000000000001',
	'guest',
	'{"en": "Guest", "vi": "Khách"}',
	'{"en": "Guest user with no permissions", "vi": "Người dùng khách không có quyền"}',
	true,
	true,
	now(),
	now()
) ON CONFLICT ("code") DO NOTHING;

-- System Role - Hệ thống (all permissions)
INSERT INTO "md_base"."roles" (
	"id", "code", "name", "description", 
	"is_system", "is_active",
	"created_at", "updated_at"
) VALUES (
	'00000000-0000-0000-0000-000000000002',
	'system',
	'{"en": "System", "vi": "Hệ thống"}',
	'{"en": "System role with all permissions", "vi": "Vai trò hệ thống với tất cả quyền"}',
	true,
	true,
	now(),
	now()
) ON CONFLICT ("code") DO NOTHING;

-- Admin Role - Quản trị viên
INSERT INTO "md_base"."roles" (
	"id", "code", "name", "description", 
	"is_system", "is_active",
	"created_at", "updated_at"
) VALUES (
	'00000000-0000-0000-0000-000000000003',
	'admin',
	'{"en": "Administrator", "vi": "Quản trị viên"}',
	'{"en": "Administrator with full access", "vi": "Quản trị viên với quyền truy cập đầy đủ"}',
	true,
	true,
	now(),
	now()
) ON CONFLICT ("code") DO NOTHING;

-- Manager Role - Quản lý
INSERT INTO "md_base"."roles" (
	"id", "code", "name", "description", 
	"is_system", "is_active",
	"created_at", "updated_at"
) VALUES (
	'00000000-0000-0000-0000-000000000004',
	'manager',
	'{"en": "Manager", "vi": "Quản lý"}',
	'{"en": "Manager role with management permissions", "vi": "Vai trò quản lý với quyền quản lý"}',
	false,
	true,
	now(),
	now()
) ON CONFLICT ("code") DO NOTHING;

-- Employee Role - Nhân viên
INSERT INTO "md_base"."roles" (
	"id", "code", "name", "description", 
	"is_system", "is_active",
	"created_at", "updated_at"
) VALUES (
	'00000000-0000-0000-0000-000000000005',
	'employee',
	'{"en": "Employee", "vi": "Nhân viên"}',
	'{"en": "Employee role with basic permissions", "vi": "Vai trò nhân viên với quyền cơ bản"}',
	false,
	true,
	now(),
	now()
) ON CONFLICT ("code") DO NOTHING;

