-- Seed data for product_categories table

-- Product categories (roots and children)
WITH roots AS (
  INSERT INTO "mdl_product"."categories" (
    "code",
    "name",
    "description",
    "parent_id",
    "level",
    "is_active",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by"
  )
  SELECT
    CONCAT('CAT', LPAD(gs::text, 2, '0')),
    jsonb_build_object('en', CONCAT('Category ', gs), 'vi', CONCAT('Danh mục ', gs)),
    jsonb_build_object('en', CONCAT('Root category ', gs), 'vi', CONCAT('Danh mục gốc ', gs)),
    NULL,
    1,
    TRUE,
    NOW(),
    NOW(),
    NULL,
    NULL
  FROM generate_series(1, 5) AS gs
  RETURNING id, code
),
ranked_roots AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM roots
)
INSERT INTO "mdl_product"."categories" (
  "code",
  "name",
  "description",
  "parent_id",
  "level",
  "is_active",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  CONCAT('CAT', LPAD((5 + gs)::text, 2, '0')),
  jsonb_build_object('en', CONCAT('Subcategory ', gs), 'vi', CONCAT('Danh mục con ', gs)),
  jsonb_build_object('en', CONCAT('Subcategory description ', gs), 'vi', CONCAT('Mô tả danh mục con ', gs)),
  (SELECT id FROM ranked_roots WHERE rn = ((gs - 1) % 5) + 1),
  2,
  TRUE,
  NOW(),
  NOW(),
  NULL,
  NULL
FROM generate_series(1, 15) AS gs;

