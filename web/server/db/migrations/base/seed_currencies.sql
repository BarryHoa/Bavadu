-- Seed currencies: USD, RUB, JPY, CNY, VND

-- VND (Việt Nam Đồng) - Currency mặc định
INSERT INTO "md_base"."currencies" (
  "code",
  "name",
  "symbol",
  "decimal_places",
  "is_default",
  "is_active",
  "created_at",
  "updated_at"
) VALUES (
  'VND',
  jsonb_build_object('en', 'Vietnamese Dong', 'vi', 'Đồng Việt Nam'),
  '₫',
  0,
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("code") DO NOTHING;

-- USD (US Dollar)
INSERT INTO "md_base"."currencies" (
  "code",
  "name",
  "symbol",
  "decimal_places",
  "is_default",
  "is_active",
  "created_at",
  "updated_at"
) VALUES (
  'USD',
  jsonb_build_object('en', 'US Dollar', 'vi', 'Đô la Mỹ'),
  '$',
  2,
  false,
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("code") DO NOTHING;

-- RUB (Russian Ruble)
INSERT INTO "md_base"."currencies" (
  "code",
  "name",
  "symbol",
  "decimal_places",
  "is_default",
  "is_active",
  "created_at",
  "updated_at"
) VALUES (
  'RUB',
  jsonb_build_object('en', 'Russian Ruble', 'vi', 'Rúp Nga'),
  '₽',
  2,
  false,
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("code") DO NOTHING;

-- JPY (Japanese Yen)
INSERT INTO "md_base"."currencies" (
  "code",
  "name",
  "symbol",
  "decimal_places",
  "is_default",
  "is_active",
  "created_at",
  "updated_at"
) VALUES (
  'JPY',
  jsonb_build_object('en', 'Japanese Yen', 'vi', 'Yên Nhật'),
  '¥',
  0,
  false,
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("code") DO NOTHING;

-- CNY (Chinese Yuan - Nhân dân tệ)
INSERT INTO "md_base"."currencies" (
  "code",
  "name",
  "symbol",
  "decimal_places",
  "is_default",
  "is_active",
  "created_at",
  "updated_at"
) VALUES (
  'CNY',
  jsonb_build_object('en', 'Chinese Yuan', 'vi', 'Nhân dân tệ'),
  '¥',
  2,
  false,
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("code") DO NOTHING;

-- Seed exchange rates for today
-- VND always has exchange rate = 1.0
INSERT INTO "md_base"."currency_exchange_rate_for_vnd" (
  "currency_id",
  "rate_date",
  "exchange_rate",
  "source",
  "note",
  "created_at",
  "updated_at"
)
SELECT 
  c.id,
  CURRENT_DATE,
  1.0,
  'system',
  'VND base currency - always 1.0',
  NOW(),
  NOW()
FROM "md_base"."currencies" c
WHERE c.code = 'VND'
ON CONFLICT ("currency_id", "rate_date") DO UPDATE
SET 
  "exchange_rate" = 1.0,
  "updated_at" = NOW();

-- USD exchange rate (example: 24500 VND = 1 USD)
INSERT INTO "md_base"."currency_exchange_rate_for_vnd" (
  "currency_id",
  "rate_date",
  "exchange_rate",
  "source",
  "note",
  "created_at",
  "updated_at"
)
SELECT 
  c.id,
  CURRENT_DATE,
  24500.00000000,
  'manual',
  'Seed data - approximate rate',
  NOW(),
  NOW()
FROM "md_base"."currencies" c
WHERE c.code = 'USD'
ON CONFLICT ("currency_id", "rate_date") DO UPDATE
SET 
  "exchange_rate" = EXCLUDED."exchange_rate",
  "updated_at" = NOW();

-- RUB exchange rate (example: 270 VND = 1 RUB)
INSERT INTO "md_base"."currency_exchange_rate_for_vnd" (
  "currency_id",
  "rate_date",
  "exchange_rate",
  "source",
  "note",
  "created_at",
  "updated_at"
)
SELECT 
  c.id,
  CURRENT_DATE,
  270.00000000,
  'manual',
  'Seed data - approximate rate',
  NOW(),
  NOW()
FROM "md_base"."currencies" c
WHERE c.code = 'RUB'
ON CONFLICT ("currency_id", "rate_date") DO UPDATE
SET 
  "exchange_rate" = EXCLUDED."exchange_rate",
  "updated_at" = NOW();

-- JPY exchange rate (example: 165 VND = 1 JPY)
INSERT INTO "md_base"."currency_exchange_rate_for_vnd" (
  "currency_id",
  "rate_date",
  "exchange_rate",
  "source",
  "note",
  "created_at",
  "updated_at"
)
SELECT 
  c.id,
  CURRENT_DATE,
  165.00000000,
  'manual',
  'Seed data - approximate rate',
  NOW(),
  NOW()
FROM "md_base"."currencies" c
WHERE c.code = 'JPY'
ON CONFLICT ("currency_id", "rate_date") DO UPDATE
SET 
  "exchange_rate" = EXCLUDED."exchange_rate",
  "updated_at" = NOW();

-- CNY exchange rate (example: 3400 VND = 1 CNY)
INSERT INTO "md_base"."currency_exchange_rate_for_vnd" (
  "currency_id",
  "rate_date",
  "exchange_rate",
  "source",
  "note",
  "created_at",
  "updated_at"
)
SELECT 
  c.id,
  CURRENT_DATE,
  3400.00000000,
  'manual',
  'Seed data - approximate rate',
  NOW(),
  NOW()
FROM "md_base"."currencies" c
WHERE c.code = 'CNY'
ON CONFLICT ("currency_id", "rate_date") DO UPDATE
SET 
  "exchange_rate" = EXCLUDED."exchange_rate",
  "updated_at" = NOW();

