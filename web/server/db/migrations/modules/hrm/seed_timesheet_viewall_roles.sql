-- Migration: Grant hrm.timesheet.viewAll to system, admin, manager, hrm-manager
-- Gán quyền xem chấm công mọi người cho system, admin, manager, quản lý HRM

INSERT INTO "md_base"."role_permissions_default" ("role_id", "permission_id", "is_active", "created_at")
SELECT
	r.id,
	p.id,
	true,
	now()
FROM "md_base"."permissions" p
CROSS JOIN "md_base"."roles" r
WHERE p.key = 'hrm.timesheet.viewAll' AND p.is_active = true
	AND r.code IN ('system', 'admin', 'manager', 'hrm-manager')
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
