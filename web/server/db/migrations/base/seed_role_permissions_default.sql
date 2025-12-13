-- Migration: Seed default permissions for roles
-- Gán default permissions cho các roles

-- ============================================
-- System Role - Tất cả permissions
-- ============================================
INSERT INTO "md_base"."role_permissions_default" ("role_id", "permission_id", "is_active", "created_at")
SELECT 
	'00000000-0000-0000-0000-000000000002'::uuid, -- system role
	p.id,
	true,
	now()
FROM "md_base"."permissions" p
WHERE p.is_active = true
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- ============================================
-- Admin Role - Tất cả permissions (giống system)
-- ============================================
INSERT INTO "md_base"."role_permissions_default" ("role_id", "permission_id", "is_active", "created_at")
SELECT 
	'00000000-0000-0000-0000-000000000003'::uuid, -- admin role
	p.id,
	true,
	now()
FROM "md_base"."permissions" p
WHERE p.is_active = true
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- ============================================
-- Manager Role - View, Create, Update, Print, Export (không có Delete và Approve)
-- ============================================
INSERT INTO "md_base"."role_permissions_default" ("role_id", "permission_id", "is_active", "created_at")
SELECT 
	'00000000-0000-0000-0000-000000000004'::uuid, -- manager role
	p.id,
	true,
	now()
FROM "md_base"."permissions" p
WHERE p.is_active = true
	AND p.action IN ('view', 'create', 'update', 'print', 'export', 'import')
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- ============================================
-- Employee Role - Chỉ View và Print
-- ============================================
INSERT INTO "md_base"."role_permissions_default" ("role_id", "permission_id", "is_active", "created_at")
SELECT 
	'00000000-0000-0000-0000-000000000005'::uuid, -- employee role
	p.id,
	true,
	now()
FROM "md_base"."permissions" p
WHERE p.is_active = true
	AND p.action IN ('view', 'print')
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- ============================================
-- Guest Role - Không có permissions (không insert gì)
-- ============================================

