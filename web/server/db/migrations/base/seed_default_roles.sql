-- Migration: Seed default system roles
-- Tạo các role mặc định của hệ thống (chỉ base roles, HRM roles sẽ được seed trong HRM module)

-- Guest Role - Khách (no permissions)
INSERT INTO "md_base"."roles" (
	"id", "code", "name", "description", 
	"permissions", "is_system", "is_active",
	"created_at", "updated_at"
) VALUES (
	'00000000-0000-0000-0000-000000000001',
	'guest',
	'{"en": "Guest", "vi": "Khách"}',
	'{"en": "Guest user with no permissions", "vi": "Người dùng khách không có quyền"}',
	'[]'::jsonb,
	true,
	true,
	now(),
	now()
) ON CONFLICT ("code") DO NOTHING;

-- System Role - Hệ thống (all permissions)
INSERT INTO "md_base"."roles" (
	"id", "code", "name", "description", 
	"permissions", "is_system", "is_active",
	"created_at", "updated_at"
) VALUES (
	'00000000-0000-0000-0000-000000000002',
	'system',
	'{"en": "System", "vi": "Hệ thống"}',
	'{"en": "System role with all permissions", "vi": "Vai trò hệ thống với tất cả quyền"}',
	'["*"]'::jsonb,
	true,
	true,
	now(),
	now()
) ON CONFLICT ("code") DO NOTHING;

-- Admin Role - Quản trị viên (all base permissions)
INSERT INTO "md_base"."roles" (
	"id", "code", "name", "description", 
	"permissions", "is_system", "is_active",
	"created_at", "updated_at"
) VALUES (
	'00000000-0000-0000-0000-000000000003',
	'admin',
	'{"en": "Administrator", "vi": "Quản trị viên"}',
	'{"en": "Administrator with full access", "vi": "Quản trị viên với quyền truy cập đầy đủ"}',
	'["base.*"]'::jsonb,
	true,
	true,
	now(),
	now()
) ON CONFLICT ("code") DO NOTHING;
