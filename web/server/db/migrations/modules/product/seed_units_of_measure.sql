-- Seed data for units_of_measure and uom_conversions tables

-- Units of measure
INSERT INTO "mdl_product"."units_of_measure" (
  "name",
  "symbol",
  "is_active",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  jsonb_build_object('en', CONCAT('Unit ', gs), 'vi', CONCAT('Đơn vị ', gs)),
  CONCAT('U', LPAD(gs::text, 2, '0')),
  gs % 5 <> 0,
  NOW() - (gs || ' days')::INTERVAL,
  NOW(),
  NULL,
  NULL
FROM generate_series(1, 20) AS gs;

-- Unit conversions
WITH uoms AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM "mdl_product"."units_of_measure"
  ORDER BY created_at, id
  LIMIT 20
)
INSERT INTO "mdl_product"."uom_conversions" (
  "uom_id",
  "conversion_ratio",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  id,
  1 + (rn::numeric / 10),
  NOW(),
  NOW(),
  NULL,
  NULL
FROM uoms;

