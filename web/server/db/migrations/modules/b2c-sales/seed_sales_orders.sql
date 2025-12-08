-- Seed data for sales_orders and sales_order_lines tables (DEPRECATED)

-- Sales orders
WITH warehouses AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "stock_warehouses"
  ORDER BY code
  LIMIT 20
)
INSERT INTO "sales_orders" (
  "code",
  "customer_name",
  "status",
  "warehouse_id",
  "expected_date",
  "total_amount",
  "currency",
  "notes",
  "created_at",
  "updated_at",
  "created_by"
)
SELECT
  CONCAT('SO', LPAD(gs::text, 4, '0')),
  CONCAT('Customer ', gs),
  (ARRAY['draft', 'confirmed', 'delivered', 'closed'])[((gs - 1) % 4) + 1],
  (SELECT id FROM warehouses WHERE rn = ((gs - 1) % 20) + 1),
  NOW() + (gs || ' days')::INTERVAL,
  (1200 + gs * 30)::numeric,
  'USD',
  CONCAT('Sales order note ', gs),
  NOW() - (gs || ' days')::INTERVAL,
  NOW(),
  CONCAT('user', ((gs - 1) % 20) + 1)
FROM generate_series(1, 20) AS gs;

-- Sales order lines
WITH orders AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM "sales_orders"
  ORDER BY created_at, id
  LIMIT 20
),
products AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "product_masters"
  ORDER BY code
  LIMIT 20
)
INSERT INTO "sales_order_lines" (
  "order_id",
  "product_id",
  "description",
  "quantity_ordered",
  "quantity_delivered",
  "unit_price",
  "created_at",
  "updated_at"
)
SELECT
  o.id,
  p.id,
  CONCAT('Sales line ', o.rn, ' for product ', p.rn),
  (8 + o.rn)::numeric,
  (o.rn % 4)::numeric,
  (65 + p.rn)::numeric,
  NOW(),
  NOW()
FROM orders o
JOIN products p ON p.rn = o.rn;

