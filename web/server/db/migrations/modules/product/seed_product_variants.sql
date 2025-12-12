-- Seed data for product_variants table

WITH masters AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "mdl_product"."masters"
  ORDER BY code
  LIMIT 20
),
uoms AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY symbol) AS rn
  FROM "mdl_product"."units_of_measure"
  ORDER BY symbol
  LIMIT 20
)
INSERT INTO "mdl_product"."variants" (
  "product_master_id",
  "name",
  "description",
  "images",
  "sku",
  "barcode",
  "manufacturer",
  "base_uom_id",
  "is_active",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  m.id,
  jsonb_build_object('en', CONCAT('Variant ', m.rn), 'vi', CONCAT('Biến thể ', m.rn)),
  jsonb_build_object('en', CONCAT('Variant description ', m.rn), 'vi', CONCAT('Mô tả biến thể ', m.rn)),
  jsonb_build_array(CONCAT('https://picsum.photos/seed/variant', m.rn, '/400/400')),
  CONCAT('SKU-', LPAD(m.rn::text, 4, '0')),
  CONCAT('BAR', LPAD((1000 + m.rn)::text, 6, '0')),
  jsonb_build_object(
    'name', jsonb_build_object('en', CONCAT('Manufacturer ', m.rn), 'vi', CONCAT('Nhà sản xuất ', m.rn)),
    'code', CONCAT('MFG', LPAD(m.rn::text, 3, '0'))
  ),
  u.id,
  TRUE,
  NOW(),
  NOW(),
  NULL,
  NULL
FROM masters m
JOIN uoms u ON u.rn = ((m.rn - 1) % 20) + 1;

