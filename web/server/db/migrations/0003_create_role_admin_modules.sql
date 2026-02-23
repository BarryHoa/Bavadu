-- 0003_create_role_admin_modules.sql
-- Bảng role_admin_modules: admin scope theo từng cấp (hrm, hrm.timesheet, hrm.payroll...)
-- Thay thế logic is_admin_modules JSONB trên roles.

CREATE TABLE IF NOT EXISTS "md_base"."role_admin_modules" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"role_id" uuid NOT NULL REFERENCES "md_base"."roles"("id") ON DELETE CASCADE,
	"scope" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36)
);

CREATE UNIQUE INDEX IF NOT EXISTS "role_admin_modules_role_scope_idx" ON "md_base"."role_admin_modules"("role_id", "scope");
CREATE INDEX IF NOT EXISTS "role_admin_modules_role_idx" ON "md_base"."role_admin_modules"("role_id");
CREATE INDEX IF NOT EXISTS "role_admin_modules_scope_idx" ON "md_base"."role_admin_modules"("scope");
CREATE INDEX IF NOT EXISTS "role_admin_modules_active_idx" ON "md_base"."role_admin_modules"("is_active");

-- Migrate data từ roles.is_admin_modules (JSONB) sang role_admin_modules
INSERT INTO "md_base"."role_admin_modules" ("role_id", "scope", "is_active", "created_at")
SELECT r.id, t.key, true, now()
FROM "md_base"."roles" r,
     jsonb_each_text(r.is_admin_modules) AS t(key, val)
WHERE t.val = 'true'
ON CONFLICT ("role_id", "scope") DO NOTHING;

-- (Tùy chọn) Có thể xóa cột is_admin_modules sau khi đã chuyển hết code:
-- ALTER TABLE "md_base"."roles" DROP COLUMN IF EXISTS "is_admin_modules";
