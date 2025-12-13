-- Migration: Add user_id column to employees table
-- Thêm cột user_id vào bảng employees để link với base.users

-- Add user_id column
ALTER TABLE "mdl_hrm"."employees"
	ADD COLUMN IF NOT EXISTS "user_id" uuid;

-- Add foreign key constraint
ALTER TABLE "mdl_hrm"."employees"
	ADD CONSTRAINT "employees_user_id_base_users_id_fk"
	FOREIGN KEY ("user_id") 
	REFERENCES "md_base"."users"("id") 
	ON DELETE SET NULL;

-- Add index
CREATE INDEX IF NOT EXISTS "employees_user_idx" ON "mdl_hrm"."employees"("user_id");

