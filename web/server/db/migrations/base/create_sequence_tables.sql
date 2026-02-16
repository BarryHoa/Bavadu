-- Migration: Create sequence_rules and sequence_counts tables
-- Tạo bảng quản lý Sequence rules và counts

-- ============================================
-- 1. sequence_rules - Định nghĩa rules sinh mã
-- ============================================
CREATE TABLE IF NOT EXISTS "md_base"."sequence_rules" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
  "name" varchar(100) NOT NULL UNIQUE,
  "prefix" varchar(50) DEFAULT '',
  "format" varchar(20) DEFAULT '%06d',
  "start" integer DEFAULT 1 NOT NULL,
  "step" integer DEFAULT 1 NOT NULL,
  "current_value" bigint DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "sequence_rules_name_idx" ON "md_base"."sequence_rules"("name");
CREATE INDEX IF NOT EXISTS "sequence_rules_active_idx" ON "md_base"."sequence_rules"("is_active");
CREATE INDEX IF NOT EXISTS "sequence_rules_created_at_idx" ON "md_base"."sequence_rules"("created_at" DESC);

-- ============================================
-- 2. sequence_counts - Lưu 3 count cuối mỗi rule
-- ============================================
CREATE TABLE IF NOT EXISTS "md_base"."sequence_counts" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
  "rule_id" uuid NOT NULL REFERENCES "md_base"."sequence_rules"("id") ON DELETE CASCADE,
  "value" varchar(100) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "sequence_counts_rule_id_idx" ON "md_base"."sequence_counts"("rule_id");
CREATE INDEX IF NOT EXISTS "sequence_counts_created_at_idx" ON "md_base"."sequence_counts"("created_at" DESC);
