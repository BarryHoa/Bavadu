-- Add system.models.read and system.models.reload for Admin module (list/reload models).
-- Required by /api/base/admin/model/get-model-list and reload-model.

INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES
('system.models.read', 'base', 'models', 'read', '{"en": "View System Models", "vi": "Xem danh sách models"}', '{"en": "Permission to list/reload system models (Admin)", "vi": "Quyền xem danh sách models (Admin)"}', true, now()),
('system.models.reload', 'base', 'models', 'reload', '{"en": "Reload System Models", "vi": "Reload models hệ thống"}', '{"en": "Permission to reload a system model (Admin)", "vi": "Quyền reload model (Admin)"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- Grant to system and admin roles
INSERT INTO "md_base"."role_permissions_default" ("role_id", "permission_id", "is_active", "created_at")
SELECT '00000000-0000-0000-0000-000000000002'::uuid, p.id, true, now()
FROM "md_base"."permissions" p
WHERE p.key IN ('system.models.read', 'system.models.reload')
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

INSERT INTO "md_base"."role_permissions_default" ("role_id", "permission_id", "is_active", "created_at")
SELECT '00000000-0000-0000-0000-000000000003'::uuid, p.id, true, now()
FROM "md_base"."permissions" p
WHERE p.key IN ('system.models.read', 'system.models.reload')
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
