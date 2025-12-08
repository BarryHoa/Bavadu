-- Seed data for stock_moves table

WITH products AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "product_masters"
  ORDER BY code
  LIMIT 20
),
warehouses AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "stock_warehouses"
  ORDER BY code
  LIMIT 20
)
INSERT INTO "stock_moves" (
  "product_id",
  "quantity",
  "type",
  "source_warehouse_id",
  "target_warehouse_id",
  "reference",
  "note",
  "created_at",
  "created_by"
)
SELECT
  p.id,
  (5 + p.rn)::numeric,
  (ARRAY['inbound', 'outbound', 'adjustment', 'transfer'])[((p.rn - 1) % 4) + 1],
  w_source.id,
  w_target.id,
  CONCAT('REF-', LPAD(p.rn::text, 4, '0')),
  CONCAT('Stock move note ', p.rn),
  NOW() - (p.rn || ' hours')::INTERVAL,
  CONCAT('system-user-', p.rn)
FROM products p
JOIN warehouses w_source ON w_source.rn = ((p.rn - 1) % 20) + 1
JOIN warehouses w_target ON w_target.rn = ((p.rn + 4 - 1) % 20) + 1;

