-- Migration: Create user_saving table
-- Lưu cài đặt/key-value theo user (vd: cột show/hide của bảng)

-- ============================================
-- User Saving
-- ============================================
CREATE TABLE IF NOT EXISTS "md_base"."user_saving" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "key" varchar(255) NOT NULL,
  "group" varchar(64) DEFAULT 'default' NOT NULL,
  "values" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "user_saving_user_key_group_uniq" UNIQUE ("user_id", "key", "group")
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "md_base"."user_saving" ADD CONSTRAINT "user_saving_user_id_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "md_base"."users"("id") ON DELETE CASCADE ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "user_saving_user_id_idx"
  ON "md_base"."user_saving" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "user_saving_group_idx"
  ON "md_base"."user_saving" USING btree ("group");
CREATE INDEX IF NOT EXISTS "user_saving_key_idx"
  ON "md_base"."user_saving" USING btree ("key");

