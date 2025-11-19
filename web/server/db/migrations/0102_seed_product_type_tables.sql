-- Seed data for product type specific tables
-- This seed file populates data for product_type_* tables based on product_variants

-- Product Type: Goods
WITH variants AS (
  SELECT id, product_master_id, ROW_NUMBER() OVER (ORDER BY sku) AS rn
  FROM "product_variants"
  WHERE EXISTS (
    SELECT 1 FROM "product_masters" pm
    WHERE pm.id = product_variants.product_master_id
    AND pm.type = 'goods'
  )
  LIMIT 10
)
INSERT INTO "product_type_goods" (
  "product_variant_id",
  "default_sale_price",
  "default_purchase_price",
  "weight",
  "dimensions",
  "color",
  "style",
  "expiry_date",
  "expiry_tracking",
  "storage_conditions",
  "created_at",
  "updated_at"
)
SELECT
  id,
  (100 + rn * 10)::numeric(18, 4),
  (80 + rn * 8)::numeric(18, 4),
  (1.5 + rn * 0.2)::numeric(10, 2),
  jsonb_build_object('length', 10 + rn, 'width', 5 + rn, 'height', 3 + rn),
  (ARRAY['Red', 'Blue', 'Green', 'Black', 'White'])[((rn - 1) % 5) + 1],
  (ARRAY['Modern', 'Classic', 'Vintage', 'Sport'])[((rn - 1) % 4) + 1],
  CASE WHEN rn % 3 = 0 THEN NOW() + (rn * 30 || ' days')::INTERVAL ELSE NULL END,
  rn % 3 = 0,
  CASE WHEN rn % 3 = 0 THEN 'Store in cool, dry place' ELSE NULL END,
  NOW(),
  NOW()
FROM variants;

-- Product Type: Raw Material
WITH variants AS (
  SELECT id, product_master_id, ROW_NUMBER() OVER (ORDER BY sku) AS rn
  FROM "product_variants"
  WHERE EXISTS (
    SELECT 1 FROM "product_masters" pm
    WHERE pm.id = product_variants.product_master_id
    AND pm.type = 'raw_material'
  )
  LIMIT 5
)
INSERT INTO "product_type_raw_material" (
  "product_variant_id",
  "default_purchase_price",
  "specifications",
  "quality_standard",
  "primary_supplier_id",
  "lead_time_days",
  "safety_stock",
  "default_reorder_point",
  "created_at",
  "updated_at"
)
SELECT
  id,
  (50 + rn * 5)::numeric(18, 4),
  jsonb_build_object(
    'purity', (95 + rn)::text || '%',
    'moisture', (5 - rn * 0.1)::text || '%',
    'grade', 'A'
  ),
  'ISO 9001:2015',
  NULL,
  7 + rn,
  (100 + rn * 20)::numeric(14, 2),
  (150 + rn * 30)::numeric(14, 2),
  NOW(),
  NOW()
FROM variants;

-- Product Type: Finished Good
WITH variants AS (
  SELECT id, product_master_id, ROW_NUMBER() OVER (ORDER BY sku) AS rn
  FROM "product_variants"
  WHERE EXISTS (
    SELECT 1 FROM "product_masters" pm
    WHERE pm.id = product_variants.product_master_id
    AND pm.type = 'finished_good'
  )
  LIMIT 5
)
INSERT INTO "product_type_finished_good" (
  "product_variant_id",
  "default_sale_price",
  "default_manufacturing_cost",
  "bom_id",
  "production_time",
  "production_unit",
  "quality_standard",
  "created_at",
  "updated_at"
)
SELECT
  id,
  (200 + rn * 20)::numeric(18, 4),
  (150 + rn * 15)::numeric(18, 4),
  NULL,
  60 + rn * 10,
  'unit',
  'QC Standard v1.0',
  NOW(),
  NOW()
FROM variants;

-- Product Type: Consumable
WITH variants AS (
  SELECT id, product_master_id, ROW_NUMBER() OVER (ORDER BY sku) AS rn
  FROM "product_variants"
  WHERE EXISTS (
    SELECT 1 FROM "product_masters" pm
    WHERE pm.id = product_variants.product_master_id
    AND pm.type = 'consumable'
  )
  LIMIT 5
)
INSERT INTO "product_type_consumable" (
  "product_variant_id",
  "default_purchase_price",
  "default_min_stock_level",
  "default_reorder_point",
  "expiry_tracking",
  "storage_conditions",
  "packaging_unit",
  "created_at",
  "updated_at"
)
SELECT
  id,
  (30 + rn * 3)::numeric(18, 4),
  (50 + rn * 10)::numeric(14, 2),
  (80 + rn * 15)::numeric(14, 2),
  rn % 2 = 0,
  'Store in dry place, avoid direct sunlight',
  (ARRAY['box', 'pack', 'bottle', 'can'])[((rn - 1) % 4) + 1],
  NOW(),
  NOW()
FROM variants;

-- Product Type: Tool
WITH variants AS (
  SELECT id, product_master_id, ROW_NUMBER() OVER (ORDER BY sku) AS rn
  FROM "product_variants"
  WHERE EXISTS (
    SELECT 1 FROM "product_masters" pm
    WHERE pm.id = product_variants.product_master_id
    AND pm.type = 'tool'
  )
  LIMIT 5
)
INSERT INTO "product_type_tool" (
  "product_variant_id",
  "serial_number",
  "model_number",
  "purchase_date",
  "purchase_price",
  "warranty_period_months",
  "maintenance_interval_days",
  "last_maintenance_date",
  "next_maintenance_date",
  "status",
  "location",
  "assigned_to_user_id",
  "created_at",
  "updated_at"
)
SELECT
  id,
  CONCAT('SN-', LPAD(rn::text, 6, '0')),
  CONCAT('MODEL-', rn),
  NOW() - (rn * 30 || ' days')::INTERVAL,
  (500 + rn * 50)::numeric(18, 4),
  12 + rn,
  90 + rn * 10,
  NOW() - (rn * 10 || ' days')::INTERVAL,
  NOW() + ((90 + rn * 10) || ' days')::INTERVAL,
  (ARRAY['in-use', 'maintenance', 'in-use'])[((rn - 1) % 3) + 1],
  CONCAT('Location ', rn),
  NULL,
  NOW(),
  NOW()
FROM variants;

-- Product Type: Asset
WITH variants AS (
  SELECT id, product_master_id, ROW_NUMBER() OVER (ORDER BY sku) AS rn
  FROM "product_variants"
  WHERE EXISTS (
    SELECT 1 FROM "product_masters" pm
    WHERE pm.id = product_variants.product_master_id
    AND pm.type = 'asset'
  )
  LIMIT 5
)
INSERT INTO "product_type_asset" (
  "product_variant_id",
  "asset_code",
  "purchase_date",
  "purchase_price",
  "depreciation_method",
  "useful_life_years",
  "residual_value",
  "depreciation_rate",
  "depreciation_start_date",
  "current_value",
  "location",
  "assigned_to_user_id",
  "created_at",
  "updated_at"
)
SELECT
  id,
  CONCAT('ASSET-', LPAD(rn::text, 6, '0')),
  NOW() - (rn * 365 || ' days')::INTERVAL,
  (10000 + rn * 1000)::numeric(18, 4),
  'straight-line',
  5 + rn,
  (1000 + rn * 100)::numeric(18, 4),
  (20.0 - rn * 0.5)::numeric(5, 2),
  NOW() - (rn * 365 || ' days')::INTERVAL,
  (10000 + rn * 1000 - (rn * 200))::numeric(18, 4),
  CONCAT('Building ', rn, ', Floor ', ((rn - 1) % 3) + 1),
  NULL,
  NOW(),
  NOW()
FROM variants;

-- Product Type: Service
WITH variants AS (
  SELECT id, product_master_id, ROW_NUMBER() OVER (ORDER BY sku) AS rn
  FROM "product_variants"
  WHERE EXISTS (
    SELECT 1 FROM "product_masters" pm
    WHERE pm.id = product_variants.product_master_id
    AND pm.type = 'service'
  )
  LIMIT 5
)
INSERT INTO "product_type_service" (
  "product_variant_id",
  "default_service_price",
  "unit",
  "duration",
  "detailed_description",
  "special_requirements",
  "created_at",
  "updated_at"
)
SELECT
  id,
  (150 + rn * 15)::numeric(18, 4),
  (ARRAY['hour', 'day', 'session', 'project'])[((rn - 1) % 4) + 1],
  60 + rn * 15,
  CONCAT('Detailed service description for service ', rn),
  CONCAT('Special requirements: ', (ARRAY['None', 'Certification required', 'Equipment needed'])[((rn - 1) % 3) + 1]),
  NOW(),
  NOW()
FROM variants;

-- Stock Settings
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
INSERT INTO "stock_settings" (
  "product_id",
  "warehouse_id",
  "min_stock_level",
  "reorder_point",
  "max_stock_level",
  "lead_time",
  "created_at",
  "updated_at"
)
SELECT
  p.id,
  w.id,
  (50 + p.rn * 5)::numeric(14, 2),
  (100 + p.rn * 10)::numeric(14, 2),
  (500 + p.rn * 50)::numeric(14, 2),
  7 + (p.rn % 14),
  NOW(),
  NOW()
FROM products p
CROSS JOIN warehouses w
WHERE (p.rn + w.rn) % 3 = 0; -- Only create settings for some combinations

-- Stock Lots
WITH variants AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY sku) AS rn
  FROM "product_variants"
  LIMIT 20
),
warehouses AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "stock_warehouses"
  ORDER BY code
  LIMIT 20
)
INSERT INTO "stock_lots" (
  "product_variant_id",
  "warehouse_id",
  "lot_number",
  "batch_number",
  "purchase_order_line_id",
  "purchase_date",
  "unit_cost",
  "quantity_received",
  "quantity_available",
  "quantity_reserved",
  "expiry_date",
  "manufacture_date",
  "status",
  "created_at",
  "updated_at"
)
SELECT
  v.id,
  w.id,
  CONCAT('LOT-', LPAD((v.rn + w.rn)::text, 6, '0')),
  CONCAT('BATCH-', LPAD((v.rn * 10 + w.rn)::text, 6, '0')),
  NULL,
  NOW() - ((v.rn + w.rn) * 5 || ' days')::INTERVAL,
  (50 + v.rn * 5)::numeric(18, 4),
  (100 + v.rn * 10)::numeric(14, 2),
  (80 + v.rn * 8)::numeric(14, 2),
  (v.rn % 5)::numeric(14, 2),
  CASE WHEN v.rn % 3 = 0 THEN NOW() + ((v.rn + w.rn) * 30 || ' days')::INTERVAL ELSE NULL END,
  NOW() - ((v.rn + w.rn) * 10 || ' days')::INTERVAL,
  (ARRAY['active', 'active', 'expired', 'depleted'])[((v.rn + w.rn - 1) % 4) + 1],
  NOW(),
  NOW()
FROM variants v
CROSS JOIN warehouses w
WHERE (v.rn + w.rn) % 4 = 0; -- Only create some lots

-- Stock Lot Moves
WITH lot_moves AS (
  SELECT 
    sl.id AS lot_id,
    sm.id AS move_id,
    ROW_NUMBER() OVER (ORDER BY sl.created_at, sm.created_at) AS rn
  FROM "stock_lots" sl
  CROSS JOIN "stock_moves" sm
  WHERE sm.product_id = (
    SELECT product_master_id FROM "product_variants" WHERE id = sl.product_variant_id
  )
  LIMIT 30
)
INSERT INTO "stock_lot_moves" (
  "stock_move_id",
  "stock_lot_id",
  "quantity",
  "unit_cost",
  "total_cost",
  "move_type",
  "created_at"
)
SELECT
  move_id,
  lot_id,
  (5 + rn * 2)::numeric(14, 2),
  (50 + rn * 3)::numeric(18, 4),
  ((5 + rn * 2) * (50 + rn * 3))::numeric(18, 4),
  (ARRAY['inbound', 'outbound', 'transfer'])[((rn - 1) % 3) + 1],
  NOW() - (rn || ' hours')::INTERVAL
FROM lot_moves;

-- Cost Variances
WITH variants AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY sku) AS rn
  FROM "product_variants"
  LIMIT 15
)
INSERT INTO "cost_variances" (
  "product_variant_id",
  "purchase_order_line_id",
  "standard_cost",
  "actual_cost",
  "variance",
  "quantity",
  "total_variance",
  "created_at"
)
SELECT
  id,
  NULL,
  (50 + rn * 5)::numeric(18, 4),
  (52 + rn * 5.2)::numeric(18, 4),
  (2 + rn * 0.2)::numeric(18, 4),
  (100 + rn * 10)::numeric(14, 2),
  ((2 + rn * 0.2) * (100 + rn * 10))::numeric(18, 4),
  NOW() - (rn || ' days')::INTERVAL
FROM variants;

