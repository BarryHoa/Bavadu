-- Migration: Add is_admin_modules column to roles
-- Lưu thông tin role là admin theo từng module dưới dạng JSONB:
-- { "hrm": true, "b2c-sales": true, ... }

ALTER TABLE "md_base"."roles"
ADD COLUMN IF NOT EXISTS "is_admin_modules" jsonb NOT NULL DEFAULT '{}'::jsonb;

