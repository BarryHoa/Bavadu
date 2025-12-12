-- Seed Price Lists B2C
-- Tạo data mẫu cho hệ thống bảng giá B2C

-- ============================================
-- 1. Price List Standard (Bảng giá chính - mãi mãi)
-- ============================================
WITH vnd_currency AS (
  SELECT id FROM "currencies" WHERE code = 'VND' LIMIT 1
)
INSERT INTO "mdl_sale_b2c"."price_lists" (
  "code",
  "name",
  "description",
  "type",
  "status",
  "priority",
  "currency_id",
  "valid_from",
  "valid_to",
  "is_default",
  "applicable_to",
  "created_at",
  "updated_at"
)
SELECT
  'PL-STD-001',
  jsonb_build_object('en', 'Standard Price List 2024', 'vi', 'Bảng giá chuẩn 2024'),
  'Bảng giá chuẩn áp dụng cho tất cả kênh và khu vực',
  'standard',
  'active',
  100,
  vnd_currency.id,
  NOW(),
  NULL, -- Mãi mãi (chỉ cho standard type)
  true, -- Là bảng giá chính
  jsonb_build_object(
    'channels', ARRAY['online', 'offline', 'mobile_app'],
    'locations', ARRAY[]::text[],
    'regions', ARRAY[]::text[],
    'customerGroups', ARRAY[]::text[]
  ),
  NOW(),
  NOW()
FROM vnd_currency
WHERE NOT EXISTS (SELECT 1 FROM "mdl_sale_b2c"."price_lists" WHERE code = 'PL-STD-001')
RETURNING id AS standard_price_list_id;

-- ============================================
-- 2. Price List Promotion (Bảng giá khuyến mãi)
-- ============================================
WITH vnd_currency AS (
  SELECT id FROM "currencies" WHERE code = 'VND' LIMIT 1
)
INSERT INTO "mdl_sale_b2c"."price_lists" (
  "code",
  "name",
  "description",
  "type",
  "status",
  "priority",
  "currency_id",
  "valid_from",
  "valid_to",
  "is_default",
  "applicable_to",
  "created_at",
  "updated_at"
)
SELECT
  'PL-PROMO-001',
  jsonb_build_object('en', 'Black Friday Promotion 2024', 'vi', 'Khuyến mãi Black Friday 2024'),
  'Bảng giá khuyến mãi Black Friday',
  'promotion',
  'active',
  200,
  vnd_currency.id,
  NOW(),
  NOW() + INTERVAL '30 days', -- Valid trong 30 ngày
  false,
  jsonb_build_object(
    'channels', ARRAY['online', 'mobile_app'],
    'locations', ARRAY[]::text[],
    'regions', ARRAY[]::text[],
    'customerGroups', ARRAY[]::text[]
  ),
  NOW(),
  NOW()
FROM vnd_currency
WHERE NOT EXISTS (SELECT 1 FROM "mdl_sale_b2c"."price_lists" WHERE code = 'PL-PROMO-001')
RETURNING id AS promo_price_list_id;

-- ============================================
-- 3. Price List Items (Explicit Pricing)
-- ============================================
-- Lấy 5 sản phẩm đầu tiên và tạo price list items cho standard price list
WITH standard_pl AS (
  SELECT id FROM "mdl_sale_b2c"."price_lists" WHERE code = 'PL-STD-001' LIMIT 1
),
sample_products AS (
  SELECT 
    pv.id AS variant_id,
    pm.id AS master_id
  FROM "product_variants" pv
  JOIN "product_masters" pm ON pv.product_master_id = pm.id
  WHERE pm.type = 'goods' AND pm.is_active = true AND pv.is_active = true
  ORDER BY pm.code, pv.id
  LIMIT 5
)
INSERT INTO "mdl_sale_b2c"."price_list_items" (
  "price_list_id",
  "product_variant_id",
  "product_master_id",
  "pricing_type",
  "base_price",
  "sale_price",
  "final_price",
  "min_quantity",
  "is_active",
  "priority",
  "created_at",
  "updated_at"
)
SELECT
  standard_pl.id,
  sp.variant_id,
  sp.master_id,
  'fixed',
  50000.0000 + (ROW_NUMBER() OVER (ORDER BY sp.variant_id) * 10000), -- Base price: 50k, 60k, 70k, 80k, 90k
  50000.0000 + (ROW_NUMBER() OVER (ORDER BY sp.variant_id) * 10000), -- Sale price = base price
  50000.0000 + (ROW_NUMBER() OVER (ORDER BY sp.variant_id) * 10000), -- Final price = sale price
  1,
  true,
  0,
  NOW(),
  NOW()
FROM standard_pl, sample_products sp
WHERE NOT EXISTS (
  SELECT 1 FROM "mdl_sale_b2c"."price_list_items" pli
  WHERE pli.price_list_id = standard_pl.id 
    AND pli.product_variant_id = sp.variant_id
)
LIMIT 5;

-- ============================================
-- 4. Pricing Rules (Rule-based Pricing)
-- ============================================
-- Rule 1: Giảm 10% cho tất cả sản phẩm (percentage discount)
WITH standard_pl AS (
  SELECT id FROM "mdl_sale_b2c"."price_lists" WHERE code = 'PL-STD-001' LIMIT 1
)
INSERT INTO "mdl_sale_b2c"."pricing_rules" (
  "price_list_id",
  "conditions",
  "pricing_method",
  "discount_type",
  "discount_value",
  "min_quantity",
  "priority",
  "is_active",
  "apply_to_exceptions",
  "created_at",
  "updated_at"
)
SELECT
  standard_pl.id,
  jsonb_build_object(
    'product_ids', ARRAY[]::text[],
    'categories', ARRAY[]::text[],
    'brands', ARRAY[]::text[]
  ),
  'percentage',
  'percentage',
  10.0000, -- Giảm 10%
  1,
  100,
  true,
  false, -- Không áp dụng cho sản phẩm có explicit pricing
  NOW(),
  NOW()
FROM standard_pl
WHERE NOT EXISTS (
  SELECT 1 FROM "mdl_sale_b2c"."pricing_rules" pr
  WHERE pr.price_list_id = standard_pl.id 
    AND pr.pricing_method = 'percentage'
    AND pr.discount_value = 10.0000
);

-- Rule 2: Fixed price cho số lượng >= 10
WITH standard_pl AS (
  SELECT id FROM "mdl_sale_b2c"."price_lists" WHERE code = 'PL-STD-001' LIMIT 1
)
INSERT INTO "mdl_sale_b2c"."pricing_rules" (
  "price_list_id",
  "conditions",
  "pricing_method",
  "fixed_price",
  "min_quantity",
  "max_quantity",
  "priority",
  "is_active",
  "apply_to_exceptions",
  "created_at",
  "updated_at"
)
SELECT
  standard_pl.id,
  jsonb_build_object(
    'product_ids', ARRAY[]::text[],
    'categories', ARRAY[]::text[]
  ),
  'fixed',
  40000.0000, -- Giá cố định 40k cho số lượng >= 10
  10,
  NULL,
  90,
  true,
  false,
  NOW(),
  NOW()
FROM standard_pl
WHERE NOT EXISTS (
  SELECT 1 FROM "mdl_sale_b2c"."pricing_rules" pr
  WHERE pr.price_list_id = standard_pl.id 
    AND pr.pricing_method = 'fixed'
    AND pr.min_quantity = 10
);

-- Rule 3: Promotion rule - Giảm 20% cho promotion price list
WITH promo_pl AS (
  SELECT id FROM "mdl_sale_b2c"."price_lists" WHERE code = 'PL-PROMO-001' LIMIT 1
)
INSERT INTO "mdl_sale_b2c"."pricing_rules" (
  "price_list_id",
  "conditions",
  "pricing_method",
  "discount_type",
  "discount_value",
  "min_quantity",
  "priority",
  "is_active",
  "apply_to_exceptions",
  "created_at",
  "updated_at"
)
SELECT
  promo_pl.id,
  jsonb_build_object(
    'product_ids', ARRAY[]::text[],
    'categories', ARRAY[]::text[]
  ),
  'percentage',
  'percentage',
  20.0000, -- Giảm 20% cho Black Friday
  1,
  100,
  true,
  true, -- Áp dụng cho tất cả sản phẩm (kể cả có explicit pricing)
  NOW(),
  NOW()
FROM promo_pl
WHERE NOT EXISTS (
  SELECT 1 FROM "mdl_sale_b2c"."pricing_rules" pr
  WHERE pr.price_list_id = promo_pl.id 
    AND pr.pricing_method = 'percentage'
    AND pr.discount_value = 20.0000
);

