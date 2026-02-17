-- 0002_add_is_admin_modules_to_roles.sql
-- Chính thức thêm cột is_admin_modules và seed cho các role core

ALTER TABLE "md_base"."roles"
ADD COLUMN IF NOT EXISTS "is_admin_modules" jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE "md_base"."roles"
SET "is_admin_modules" = '{"base": true, "hrm": true, "b2c-sales": true, "product": true, "stock": true}'::jsonb
WHERE "code" IN ('system', 'admin');

