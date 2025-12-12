-- Seed: Customer Individuals
-- Seed dữ liệu mẫu cho customer_individuals

INSERT INTO "mdl_sale_b2c"."customers" (
  "code",
  "first_name",
  "last_name",
  "phone",
  "email",
  "address",
  "date_of_birth",
  "gender",
  "is_active",
  "notes",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  CONCAT('B2C', LPAD(gs::text, 4, '0')),
  CONCAT('First', gs),
  CONCAT('Last', gs),
  CONCAT('+84-09', LPAD(gs::text, 3, '0')),
  CONCAT('customer', gs, '@example.com'),
  CONCAT('Address ', gs, ', Hanoi, Vietnam'),
  DATE '1990-01-01' + (gs * INTERVAL '30 days'),
  (ARRAY['male', 'female', 'other'])[((gs - 1) % 3) + 1],
  true,
  CONCAT('Notes for customer ', gs),
  NOW() - (gs || ' days')::INTERVAL,
  NOW(),
  NULL,
  NULL
FROM generate_series(1, 15) AS gs
WHERE NOT EXISTS (
  SELECT 1 FROM "mdl_sale_b2c"."customers" WHERE "code" = CONCAT('B2C', LPAD(gs::text, 4, '0'))
);
