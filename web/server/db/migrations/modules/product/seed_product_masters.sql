-- Seed data for product_masters table

WITH cats AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "product_categories"
  ORDER BY code
  LIMIT 20
)
INSERT INTO "product_masters" (
  "code",
  "name",
  "image",
  "description",
  "type",
  "features",
  "is_active",
  "brand",
  "category_id",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  CONCAT('PROD', LPAD(rn::text, 3, '0')),
  jsonb_build_object('en', CONCAT('Product ', rn), 'vi', CONCAT('Sản phẩm ', rn)),
  CONCAT('https://picsum.photos/seed/product', rn, '/400/400'),
  jsonb_build_object('en', CONCAT('Product description ', rn), 'vi', CONCAT('Mô tả sản phẩm ', rn)),
  (ARRAY['goods', 'service', 'finished_good', 'raw_material', 'consumable', 'asset', 'tool'])[((rn - 1) % 7) + 1],
  jsonb_build_object(
    'sale', TRUE,
    'purchase', rn % 2 = 0,
    'manufacture', rn % 3 = 0,
    'stockable', rn % 4 <> 0
  ),
  TRUE,
  jsonb_build_object('en', CONCAT('Brand ', ((rn - 1) % 5) + 1), 'vi', CONCAT('Thương hiệu ', ((rn - 1) % 5) + 1)),
  id,
  NOW(),
  NOW(),
  NULL,
  NULL
FROM cats;

