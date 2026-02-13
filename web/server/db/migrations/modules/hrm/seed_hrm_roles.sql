-- Migration: Seed HRM-specific roles
-- Tạo các role HRM trong base.roles (roles là global nhưng có HRM permissions)

-- HRM Manager Role - Quản lý HRM (id 6)
INSERT INTO "md_base"."roles" (
	"id", "code", "name", "description",
	"is_system", "is_active",
	"created_at", "updated_at"
) VALUES (
	'00000000-0000-0000-0000-000000000006',
	'hrm-manager',
	'{"en": "HRM Manager", "vi": "Quản lý HRM"}',
	'{"en": "HRM Manager with full HRM permissions", "vi": "Quản lý HRM với đầy đủ quyền HRM"}',
	true,
	true,
	now(),
	now()
) ON CONFLICT ("code") DO NOTHING;

-- HRM Employee Role - Nhân viên HRM (view only) (id 7)
INSERT INTO "md_base"."roles" (
	"id", "code", "name", "description",
	"is_system", "is_active",
	"created_at", "updated_at"
) VALUES (
	'00000000-0000-0000-0000-000000000007',
	'hrm-employee',
	'{"en": "HRM Employee", "vi": "Nhân viên HRM"}',
	'{"en": "HRM Employee with view permissions", "vi": "Nhân viên HRM với quyền xem"}',
	true,
	true,
	now(),
	now()
) ON CONFLICT ("code") DO NOTHING;

-- HRM Payroll Role - Quản lý lương (id 8)
INSERT INTO "md_base"."roles" (
	"id", "code", "name", "description",
	"is_system", "is_active",
	"created_at", "updated_at"
) VALUES (
	'00000000-0000-0000-0000-000000000008',
	'hrm-payroll',
	'{"en": "HRM Payroll", "vi": "Quản lý lương HRM"}',
	'{"en": "HRM Payroll management role", "vi": "Vai trò quản lý lương HRM"}',
	true,
	true,
	now(),
	now()
) ON CONFLICT ("code") DO NOTHING;

-- ============================================
-- Role Permissions Default - Gán quyền cho HRM roles
-- ============================================

-- HRM Manager - Tất cả HRM permissions
INSERT INTO "md_base"."role_permissions_default" ("role_id", "permission_id", "is_active", "created_at")
SELECT
	'00000000-0000-0000-0000-000000000006'::uuid,
	p.id,
	true,
	now()
FROM "md_base"."permissions" p
WHERE p.module = 'hrm' AND p.is_active = true
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- HRM Employee - Chỉ view: employee, department, leave_request
INSERT INTO "md_base"."role_permissions_default" ("role_id", "permission_id", "is_active", "created_at")
SELECT
	'00000000-0000-0000-0000-000000000007'::uuid,
	p.id,
	true,
	now()
FROM "md_base"."permissions" p
WHERE p.module = 'hrm' AND p.is_active = true
	AND p.action = 'view'
	AND p.resource IN ('employee', 'department', 'leave_request')
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- HRM Payroll - Payroll permissions
INSERT INTO "md_base"."role_permissions_default" ("role_id", "permission_id", "is_active", "created_at")
SELECT
	'00000000-0000-0000-0000-000000000008'::uuid,
	p.id,
	true,
	now()
FROM "md_base"."permissions" p
WHERE p.module = 'hrm' AND p.resource = 'payroll' AND p.is_active = true
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
