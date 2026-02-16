-- Migration: Seed permissions for Sequence module
-- Chỉ system role mới có quyền thêm rule (base.sequence.create)

INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES
('base.sequence.view', 'base', 'sequence', 'view', '{"en": "View Sequences", "vi": "Xem sequence"}', '{"en": "Permission to view sequence rules", "vi": "Quyền xem rules sequence"}', true, now()),
('base.sequence.create', 'base', 'sequence', 'create', '{"en": "Create Sequence Rules", "vi": "Tạo rule sequence"}', '{"en": "Permission to create sequence rules (system only)", "vi": "Quyền tạo rule sequence (chỉ system)"}', true, now()),
('base.sequence.update', 'base', 'sequence', 'update', '{"en": "Update Sequence Rules", "vi": "Cập nhật rule sequence"}', '{"en": "Permission to update/active/inactive sequence rules", "vi": "Quyền cập nhật/active/inactive rules"}', true, now())
ON CONFLICT ("key") DO NOTHING;
