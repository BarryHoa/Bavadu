-- Seed data for purchase_orders and purchase_order_lines tables

-- Purchase orders
WITH warehouses AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "stock_warehouses"
  ORDER BY code
  LIMIT 20
)
INSERT INTO "purchase_orders" (
  "code",
  "vendor_name",
  "status",
  "expected_date",
  "warehouse_id",
  "total_amount",
  "currency",
  "notes",
  "created_at",
  "updated_at",
  "created_by"
)
SELECT
  CONCAT('PO', LPAD(gs::text, 4, '0')),
  CONCAT('Vendor ', gs),
  (ARRAY['draft', 'confirmed', 'received', 'closed'])[((gs - 1) % 4) + 1],
  NOW() + (gs || ' days')::INTERVAL,
  (SELECT id FROM warehouses WHERE rn = ((gs - 1) % 20) + 1),
  (1000 + gs * 25)::numeric,
  'USD',
  CONCAT('Purchase order note ', gs),
  NOW() - (gs || ' days')::INTERVAL,
  NOW(),
  CONCAT('user', ((gs - 1) % 20) + 1)
FROM generate_series(1, 20) AS gs;

-- Purchase order lines
WITH orders AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM "purchase_orders"
  ORDER BY created_at, id
  LIMIT 20
),
products AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "product_masters"
  ORDER BY code
  LIMIT 20
)
INSERT INTO "purchase_order_lines" (
  "order_id",
  "product_id",
  "description",
  "quantity_ordered",
  "quantity_received",
  "unit_price",
  "created_at",
  "updated_at"
)
SELECT
  o.id,
  p.id,
  CONCAT('Purchase line ', o.rn, ' for product ', p.rn),
  (10 + o.rn)::numeric,
  (o.rn % 5)::numeric,
  (50 + p.rn)::numeric,
  NOW(),
  NOW()
FROM orders o
JOIN products p ON p.rn = o.rn;

