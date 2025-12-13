-- Migration: Seed HRM-specific roles
-- Tạo các role HRM trong base.roles (roles là global nhưng có HRM permissions)

-- HRM Manager Role - Quản lý HRM
INSERT INTO "md_base"."roles" (
	"id", "code", "name", "description", 
	"permissions", "is_system", "is_active",
	"created_at", "updated_at"
) VALUES (
	'00000000-0000-0000-0000-000000000004',
	'hrm-manager',
	'{"en": "HRM Manager", "vi": "Quản lý HRM"}',
	'{"en": "HRM Manager with full HRM permissions", "vi": "Quản lý HRM với đầy đủ quyền HRM"}',
	'["hrm.*"]'::jsonb,
	true,
	true,
	now(),
	now()
) ON CONFLICT ("code") DO NOTHING;

-- HRM Employee Role - Nhân viên HRM (view only)
INSERT INTO "md_base"."roles" (
	"id", "code", "name", "description", 
	"permissions", "is_system", "is_active",
	"created_at", "updated_at"
) VALUES (
	'00000000-0000-0000-0000-000000000005',
	'hrm-employee',
	'{"en": "HRM Employee", "vi": "Nhân viên HRM"}',
	'{"en": "HRM Employee with view permissions", "vi": "Nhân viên HRM với quyền xem"}',
	'["hrm.employee.view", "hrm.employee.list", "hrm.department.view", "hrm.department.list", "hrm.position.view", "hrm.position.list"]'::jsonb,
	true,
	true,
	now(),
	now()
) ON CONFLICT ("code") DO NOTHING;

-- HRM Payroll Role - Quản lý lương
INSERT INTO "md_base"."roles" (
	"id", "code", "name", "description", 
	"permissions", "is_system", "is_active",
	"created_at", "updated_at"
) VALUES (
	'00000000-0000-0000-0000-000000000006',
	'hrm-payroll',
	'{"en": "HRM Payroll", "vi": "Quản lý lương HRM"}',
	'{"en": "HRM Payroll management role", "vi": "Vai trò quản lý lương HRM"}',
	'["hrm.payroll.*", "hrm.payroll-period.*", "hrm.payroll-rule.*"]'::jsonb,
	true,
	true,
	now(),
	now()
) ON CONFLICT ("code") DO NOTHING;

