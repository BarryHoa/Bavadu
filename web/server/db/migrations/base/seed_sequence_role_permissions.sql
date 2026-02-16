-- Migration: Grant base.sequence.create ONLY to system role
-- Admin và các role khác không có quyền tạo rule mới

INSERT INTO "md_base"."role_permissions_default" ("role_id", "permission_id", "is_active", "created_at")
SELECT
  '00000000-0000-0000-0000-000000000002'::uuid,
  p.id,
  true,
  now()
FROM "md_base"."permissions" p
WHERE p.key = 'base.sequence.create'
  AND p.is_active = true
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- Grant base.sequence.view và base.sequence.update cho system và admin
INSERT INTO "md_base"."role_permissions_default" ("role_id", "permission_id", "is_active", "created_at")
SELECT
  r.id,
  p.id,
  true,
  now()
FROM "md_base"."roles" r
CROSS JOIN "md_base"."permissions" p
WHERE r.id IN (
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000003'::uuid
)
AND p.key IN ('base.sequence.view', 'base.sequence.update')
AND p.is_active = true
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
