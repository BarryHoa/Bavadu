-- Migration: Remove module column from roles table
-- Xóa cột module khỏi bảng roles (nếu đã tồn tại)

-- Drop unique constraint on module + code if exists
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.table_constraints 
		WHERE constraint_name = 'roles_module_code_unique'
		AND table_schema = 'md_base'
		AND table_name = 'roles'
	) THEN
		ALTER TABLE "md_base"."roles" 
			DROP CONSTRAINT "roles_module_code_unique";
	END IF;
END $$;

-- Drop index on module if exists
DROP INDEX IF EXISTS "md_base"."roles_module_idx";

-- Drop module column if exists
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'md_base'
		AND table_name = 'roles'
		AND column_name = 'module'
	) THEN
		ALTER TABLE "md_base"."roles" DROP COLUMN "module";
	END IF;
END $$;

-- Add unique constraint on code only
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.table_constraints 
		WHERE constraint_name = 'roles_code_unique'
		AND table_schema = 'md_base'
		AND table_name = 'roles'
	) THEN
		ALTER TABLE "md_base"."roles" 
			ADD CONSTRAINT "roles_code_unique" UNIQUE("code");
	END IF;
END $$;

