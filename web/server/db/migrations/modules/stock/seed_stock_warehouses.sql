-- Seed data for stock_warehouses table

WITH user_rows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM "users"
  ORDER BY created_at, id
  LIMIT 20
)
INSERT INTO "stock_warehouses" (
  "code",
  "name",
  "type_code",
  "status",
  "company_id",
  "manager_id",
  "contact_id",
  "address",
  "valuation_method",
  "min_stock",
  "max_stock",
  "account_inventory",
  "account_adjustment",
  "notes",
  "created_at",
  "updated_at"
)
SELECT
  CONCAT('WH', LPAD(gs::text, 2, '0')),
  CONCAT('Warehouse ', gs),
  CONCAT('TYPE', ((gs - 1) % 4) + 1),
  (ARRAY['ACTIVE', 'MAINTENANCE', 'SUSPENDED', 'CLOSED'])[((gs - 1) % 4) + 1],
  NULL,
  (SELECT id FROM user_rows WHERE rn = ((gs - 1) % 20) + 1),
  (SELECT id FROM user_rows WHERE rn = ((gs + 9) % 20) + 1),
  jsonb_build_object('line1', CONCAT('Warehouse Street ', gs), 'city', 'Hanoi', 'country', 'VN'),
  (ARRAY['FIFO', 'LIFO', 'AVG'])[((gs - 1) % 3) + 1],
  (gs * 10)::numeric,
  (gs * 20)::numeric,
  CONCAT('INV', LPAD(gs::text, 4, '0')),
  CONCAT('ADJ', LPAD(gs::text, 4, '0')),
  CONCAT('Warehouse note ', gs),
  NOW(),
  NOW()
FROM generate_series(1, 20) AS gs;

