-- Seed data for product_packings table

WITH variants AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM "product_variants"
  ORDER BY created_at, id
  LIMIT 20
)
INSERT INTO "product_packings" (
  "product_variant_id",
  "name",
  "description",
  "is_active",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  id,
  jsonb_build_object('en', CONCAT('Packing ', rn), 'vi', CONCAT('Đóng gói ', rn)),
  CONCAT('Packing description ', rn),
  TRUE,
  NOW(),
  NOW(),
  NULL,
  NULL
FROM variants;

