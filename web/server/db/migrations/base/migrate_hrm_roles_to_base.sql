-- Migration: Migrate HRM roles to base roles
-- Di chuyển roles từ HRM schema sang base schema

-- Migrate HRM roles to base roles
INSERT INTO "md_base"."roles" (
	"id", "code", "name", "description", 
	"permissions", "is_system", "is_active",
	"created_at", "updated_at", "created_by", "updated_by"
)
SELECT 
	"id", "code", "name", "description",
	"permissions", "is_system", "is_active",
	"created_at", "updated_at", "created_by", "updated_by"
FROM "mdl_hrm"."roles"
ON CONFLICT ("code") DO NOTHING;

-- Update employee_roles to reference base.roles
-- First, drop old foreign key constraint if exists
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.table_constraints 
		WHERE constraint_name = 'employee_roles_role_id_roles_id_fk'
		AND table_schema = 'mdl_hrm'
		AND table_name = 'employee_roles'
	) THEN
		ALTER TABLE "mdl_hrm"."employee_roles" 
			DROP CONSTRAINT "employee_roles_role_id_roles_id_fk";
	END IF;
END $$;

-- Add new foreign key to base.roles
ALTER TABLE "mdl_hrm"."employee_roles"
	ADD CONSTRAINT "employee_roles_role_id_base_roles_id_fk"
	FOREIGN KEY ("role_id") 
	REFERENCES "md_base"."roles"("id") 
	ON DELETE RESTRICT;

