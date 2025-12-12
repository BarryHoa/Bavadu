-- Seed data for stock_levels table

WITH products AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "product_masters"
  ORDER BY code
  LIMIT 20
),
warehouses AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "mdl_stock"."warehouses"
  ORDER BY code
  LIMIT 20
)
INSERT INTO "mdl_stock"."levels" (
  "product_id",
  "warehouse_id",
  "quantity",
  "reserved_quantity",
  "average_cost",
  "total_cost_value",
  "created_at",
  "updated_at"
)
SELECT
  p.id,
  w.id,
  (15 + p.rn * 2)::numeric,
  (p.rn % 5)::numeric,
  (10 + p.rn)::numeric(18, 4),
  ((15 + p.rn * 2) * (10 + p.rn))::numeric(18, 4),
  NOW(),
  NOW()
FROM products p
JOIN warehouses w ON w.rn = ((p.rn - 1) % 20) + 1;

