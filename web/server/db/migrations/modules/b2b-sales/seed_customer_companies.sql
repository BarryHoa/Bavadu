-- Seed: Customer Companies
-- Seed dữ liệu mẫu cho customer_companies

INSERT INTO "customer_companies" (
  "code",
  "name",
  "tax_id",
  "address",
  "phone",
  "email",
  "website",
  "contact_person",
  "credit_limit",
  "payment_terms_id",
  "is_active",
  "notes",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  CONCAT('B2B', LPAD(gs::text, 4, '0')),
  CONCAT('Company ', gs),
  CONCAT('010', LPAD(gs::text, 7, '0')),
  CONCAT('Address ', gs, ', Hanoi, Vietnam'),
  CONCAT('+84-', LPAD((900 + gs)::text, 8, '0')),
  CONCAT('company', gs, '@example.com'),
  CONCAT('https://company', gs, '.com'),
  CONCAT('Contact Person ', gs),
  (100000 + gs * 10000)::numeric(14, 2),
  (SELECT id FROM "payment_terms" WHERE "type" = 'b2b' ORDER BY "order" LIMIT 1 OFFSET (gs - 1) % 3),
  true,
  CONCAT('Notes for company ', gs),
  NOW() - (gs || ' days')::INTERVAL,
  NOW(),
  NULL,
  NULL
FROM generate_series(1, 10) AS gs
WHERE NOT EXISTS (
  SELECT 1 FROM "customer_companies" WHERE "code" = CONCAT('B2B', LPAD(gs::text, 4, '0'))
);
