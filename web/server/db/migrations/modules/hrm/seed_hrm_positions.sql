-- Migration: Seed HRM positions
-- Tạo các vị trí mặc định (gắn với phòng ban ROOT)

INSERT INTO "mdl_hrm"."positions" (
	"code", "name", "description",
	"department_id", "is_active",
	"created_at", "updated_at"
)
SELECT
	'CEO', jsonb_build_object('en', 'Chief Executive Officer', 'vi', 'Giám đốc điều hành'), '{"en": "CEO position", "vi": "Vị trí CEO"}',
	d.id, true, now(), now()
FROM "mdl_hrm"."departments" d
WHERE d.code = 'ROOT' AND NOT EXISTS (SELECT 1 FROM "mdl_hrm"."positions" WHERE "code" = 'CEO')
LIMIT 1;

INSERT INTO "mdl_hrm"."positions" (
	"code", "name", "description",
	"department_id", "is_active",
	"created_at", "updated_at"
)
SELECT
	'MANAGER', jsonb_build_object('en', 'Manager', 'vi', 'Quản lý'), '{"en": "Manager position", "vi": "Vị trí quản lý"}',
	d.id, true, now(), now()
FROM "mdl_hrm"."departments" d
WHERE d.code = 'ROOT' AND NOT EXISTS (SELECT 1 FROM "mdl_hrm"."positions" WHERE "code" = 'MANAGER')
LIMIT 1;

INSERT INTO "mdl_hrm"."positions" (
	"code", "name", "description",
	"department_id", "is_active",
	"created_at", "updated_at"
)
SELECT
	'STAFF', jsonb_build_object('en', 'Staff', 'vi', 'Nhân viên'), '{"en": "Staff position", "vi": "Vị trí nhân viên"}',
	d.id, true, now(), now()
FROM "mdl_hrm"."departments" d
WHERE d.code = 'ROOT' AND NOT EXISTS (SELECT 1 FROM "mdl_hrm"."positions" WHERE "code" = 'STAFF')
LIMIT 1;
