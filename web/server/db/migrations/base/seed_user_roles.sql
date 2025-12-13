-- Migration: Seed user roles
-- Gán roles cho các users hiện có

-- ============================================
-- User 1 - Admin role
-- ============================================
INSERT INTO "md_base"."user_roles" ("user_id", "role_id", "is_active", "created_at")
SELECT 
	u.id,
	'00000000-0000-0000-0000-000000000003'::uuid, -- admin role
	true,
	now()
FROM "md_base"."users" u
ORDER BY u.created_at, u.id
LIMIT 1
ON CONFLICT ("user_id", "role_id") DO NOTHING;

-- ============================================
-- Users 2-5 - Manager role
-- ============================================
INSERT INTO "md_base"."user_roles" ("user_id", "role_id", "is_active", "created_at")
SELECT 
	u.id,
	'00000000-0000-0000-0000-000000000004'::uuid, -- manager role
	true,
	now()
FROM "md_base"."users" u
ORDER BY u.created_at, u.id
OFFSET 1
LIMIT 4
ON CONFLICT ("user_id", "role_id") DO NOTHING;

-- ============================================
-- Users 6-19 - Employee role
-- ============================================
INSERT INTO "md_base"."user_roles" ("user_id", "role_id", "is_active", "created_at")
SELECT 
	u.id,
	'00000000-0000-0000-0000-000000000005'::uuid, -- employee role
	true,
	now()
FROM "md_base"."users" u
ORDER BY u.created_at, u.id
OFFSET 5
LIMIT 14
ON CONFLICT ("user_id", "role_id") DO NOTHING;

-- ============================================
-- User 20 - Guest role (for testing)
-- ============================================
INSERT INTO "md_base"."user_roles" ("user_id", "role_id", "is_active", "created_at")
SELECT 
	u.id,
	'00000000-0000-0000-0000-000000000001'::uuid, -- guest role
	true,
	now()
FROM "md_base"."users" u
ORDER BY u.created_at, u.id
OFFSET 19
LIMIT 1
ON CONFLICT ("user_id", "role_id") DO NOTHING;

