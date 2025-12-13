-- Migration: Remove HRM-related fields from users table
-- Xóa các fields HRM-related từ bảng users (position, department, joined_at, salary)

-- Drop indexes first
DROP INDEX IF EXISTS "md_base"."users_department_idx";
DROP INDEX IF EXISTS "md_base"."users_joined_idx";

-- Drop columns
ALTER TABLE "md_base"."users" 
	DROP COLUMN IF EXISTS "position",
	DROP COLUMN IF EXISTS "department",
	DROP COLUMN IF EXISTS "joined_at",
	DROP COLUMN IF EXISTS "salary";

