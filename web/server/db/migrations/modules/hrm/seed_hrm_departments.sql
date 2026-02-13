-- Migration: Seed HRM root department
-- Tạo phòng ban gốc mặc định

INSERT INTO "mdl_hrm"."departments" (
	"code", "name", "description",
	"parent_id", "level", "is_active",
	"created_at", "updated_at"
) VALUES (
	'ROOT',
	jsonb_build_object('en', 'Headquarters', 'vi', 'Trụ sở chính'),
	'{"en": "Root department - headquarters", "vi": "Phòng ban gốc - trụ sở chính"}',
	NULL,
	0,
	true,
	now(),
	now()
) ON CONFLICT ("code") DO NOTHING;
