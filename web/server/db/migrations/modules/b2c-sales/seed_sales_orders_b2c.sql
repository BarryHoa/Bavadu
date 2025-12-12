-- Seed: Sales Orders B2C
-- Seed dữ liệu mẫu cho sales_orders_b2c

WITH customers AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "mdl_sale_b2c"."customers"
  LIMIT 15
),
warehouses AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "stock_warehouses"
  LIMIT 10
),
payment_methods AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "order") AS rn
  FROM "payment_methods"
  WHERE "type" IN ('b2c', 'all')
  LIMIT 5
),
shipping_methods AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "order") AS rn
  FROM "shipping_methods"
  WHERE "type" IN ('b2c', 'all')
  LIMIT 5
),
shipping_terms AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "order") AS rn
  FROM "shipping_terms"
  WHERE "type" IN ('b2c', 'all')
  LIMIT 5
)
INSERT INTO "mdl_sale_b2c"."orders" (
  "code",
  "status",
  "customer_name",
  "customer_phone",
  "customer_email",
  "delivery_address",
  "payment_method_id",
  "shipping_method_id",
  "shipping_terms_id",
  "require_invoice",
  "warehouse_id",
  "expected_date",
  "subtotal",
  "total_discount",
  "total_tax",
  "shipping_fee",
  "grand_total",
  "total_amount",
  "currency",
  "currency_rate",
  "completed_at",
  "notes",
  "created_at",
  "updated_at",
  "created_by"
)
SELECT
  CONCAT('SO-B2C-', LPAD(gs::text, 4, '0')),
  (ARRAY['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'])[((gs - 1) % 7) + 1],
  CONCAT('Customer ', gs),
  CONCAT('+84-09', LPAD(gs::text, 3, '0')),
  CONCAT('customer', gs, '@example.com'),
  CONCAT('Delivery Address ', gs, ', Hanoi, Vietnam'),
  (SELECT id FROM payment_methods WHERE rn = ((gs - 1) % 5) + 1),
  (SELECT id FROM shipping_methods WHERE rn = ((gs - 1) % 5) + 1),
  (SELECT id FROM shipping_terms WHERE rn = ((gs - 1) % 5) + 1),
  gs % 3 = 0,
  (SELECT id FROM warehouses WHERE rn = ((gs - 1) % 10) + 1),
  NOW() + (gs || ' days')::INTERVAL,
  (5000 + gs * 500)::numeric(14, 2),
  (gs * 50)::numeric(14, 2),
  ((5000 + gs * 500) * 0.1)::numeric(14, 2),
  (300 + gs * 30)::numeric(14, 2),
  ((5000 + gs * 500) - (gs * 50) + ((5000 + gs * 500) * 0.1) + (300 + gs * 30))::numeric(14, 2),
  ((5000 + gs * 500) - (gs * 50) + ((5000 + gs * 500) * 0.1) + (300 + gs * 30))::numeric(14, 2),
  'VND',
  1.0,
  CASE WHEN gs % 3 = 0 THEN NOW() - ((gs - 2) || ' days')::INTERVAL ELSE NULL END,
  CONCAT('Notes for B2C order ', gs),
  NOW() - (gs || ' days')::INTERVAL,
  NOW(),
  CONCAT('user', ((gs - 1) % 20) + 1)
FROM generate_series(1, 15) AS gs
WHERE NOT EXISTS (
  SELECT 1 FROM "mdl_sale_b2c"."orders" WHERE "code" = CONCAT('SO-B2C-', LPAD(gs::text, 4, '0'))
);
