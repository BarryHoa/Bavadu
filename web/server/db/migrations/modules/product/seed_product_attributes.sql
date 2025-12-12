-- Seed data for product_attributes table

WITH variant_rows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM "mdl_product"."variants"
  ORDER BY created_at, id
  LIMIT 20
)
INSERT INTO "mdl_product"."attributes" (
  "product_variant_id",
  "code",
  "name",
  "value",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  id,
  CONCAT('ATTR', LPAD(rn::text, 4, '0')),
  jsonb_build_object('en', CONCAT('Attribute ', rn), 'vi', CONCAT('Thuộc tính ', rn)),
  CONCAT('Value ', rn),
  NOW(),
  NOW(),
  NULL,
  NULL
FROM variant_rows;

