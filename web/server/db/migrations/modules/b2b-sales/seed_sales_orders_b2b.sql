-- Seed: Sales Orders B2B
-- Seed dữ liệu mẫu cho sales_orders_b2b

WITH companies AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "mdl_sale_b2b"."customers"
  LIMIT 10
),
warehouses AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "stock_warehouses"
  LIMIT 10
),
payment_terms AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "order") AS rn
  FROM "payment_terms"
  WHERE "type" IN ('b2b', 'all')
  LIMIT 5
),
shipping_methods AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "order") AS rn
  FROM "shipping_methods"
  WHERE "type" IN ('b2b', 'all')
  LIMIT 5
),
shipping_terms AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "order") AS rn
  FROM "shipping_terms"
  WHERE "type" IN ('b2b', 'all')
  LIMIT 5
)
INSERT INTO "mdl_sale_b2b"."orders" (
  "code",
  "status",
  "company_name",
  "tax_id",
  "contact_person",
  "contact_phone",
  "contact_email",
  "company_address",
  "payment_terms_id",
  "credit_limit",
  "invoice_required",
  "shipping_method_id",
  "shipping_terms_id",
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
  "notes",
  "created_at",
  "updated_at",
  "created_by"
)
SELECT
  CONCAT('SO-B2B-', LPAD(gs::text, 4, '0')),
  (ARRAY['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'])[((gs - 1) % 7) + 1],
  CONCAT('Company ', gs),
  CONCAT('010', LPAD(gs::text, 7, '0')),
  CONCAT('Contact Person ', gs),
  CONCAT('+84-09', LPAD(gs::text, 3, '0')),
  CONCAT('contact', gs, '@example.com'),
  CONCAT('Company Address ', gs, ', Hanoi, Vietnam'),
  (SELECT id FROM payment_terms WHERE rn = ((gs - 1) % 5) + 1),
  (50000 + gs * 5000)::numeric(14, 2),
  gs % 2 = 0,
  (SELECT id FROM shipping_methods WHERE rn = ((gs - 1) % 5) + 1),
  (SELECT id FROM shipping_terms WHERE rn = ((gs - 1) % 5) + 1),
  (SELECT id FROM warehouses WHERE rn = ((gs - 1) % 10) + 1),
  NOW() + (gs || ' days')::INTERVAL,
  (10000 + gs * 1000)::numeric(14, 2),
  (gs * 100)::numeric(14, 2),
  ((10000 + gs * 1000) * 0.1)::numeric(14, 2),
  (500 + gs * 50)::numeric(14, 2),
  ((10000 + gs * 1000) - (gs * 100) + ((10000 + gs * 1000) * 0.1) + (500 + gs * 50))::numeric(14, 2),
  ((10000 + gs * 1000) - (gs * 100) + ((10000 + gs * 1000) * 0.1) + (500 + gs * 50))::numeric(14, 2),
  'VND',
  1.0,
  CONCAT('Notes for B2B order ', gs),
  NOW() - (gs || ' days')::INTERVAL,
  NOW(),
  CONCAT('user', ((gs - 1) % 20) + 1)
FROM generate_series(1, 10) AS gs
WHERE NOT EXISTS (
  SELECT 1 FROM "mdl_sale_b2b"."orders" WHERE "code" = CONCAT('SO-B2B-', LPAD(gs::text, 4, '0'))
);
