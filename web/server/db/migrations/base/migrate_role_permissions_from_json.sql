-- Migration: Migrate permissions from roles.permissions (jsonb) to role_permissions table
-- Di chuyển permissions từ jsonb array trong roles table sang role_permissions table

-- Migrate permissions from roles.permissions jsonb to role_permissions table
INSERT INTO "md_base"."role_permissions" (
	"role_id", "permission_key", "is_active", "created_at"
)
SELECT 
	r."id" as "role_id",
	jsonb_array_elements_text(r."permissions")::varchar(100) as "permission_key",
	true as "is_active",
	now() as "created_at"
FROM "md_base"."roles" r
WHERE r."permissions" IS NOT NULL
	AND jsonb_typeof(r."permissions") = 'array'
ON CONFLICT ("role_id", "permission_key") DO NOTHING;

-- Note: After migration, you can optionally remove the permissions column from roles table
-- But keep it for backward compatibility or remove it in a separate migration

