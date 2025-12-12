-- Seed location data for Vietnam
-- Generated from: danh-sach-3321-xa-phuong_v2.ts
-- Total records: 3355
-- Generated at: 2025-11-15T11:59:17.504Z

-- First, ensure Vietnam country exists
INSERT INTO "md_base"."location_countries" (
  "code",
  "name",
  "is_active",
  "created_at",
  "updated_at"
)
VALUES (
  'VN',
  '{"vi": "Việt Nam", "en": "Vietnam"}'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "updated_at" = NOW();

