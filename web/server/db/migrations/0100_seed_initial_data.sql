-- Seed dataset providing ~20 records per table for development and testing

-- Users
INSERT INTO "users" (
  "avatar",
  "gender",
  "date_of_birth",
  "bio",
  "first_name",
  "last_name",
  "phones",
  "addresses",
  "emails",
  "position",
  "department",
  "joined_at",
  "salary",
  "address",
  "notes",
  "status",
  "is_verified",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  CONCAT('https://example.com/avatar/', gs, '.png'),
  (ARRAY['male', 'female', 'other'])[((gs - 1) % 3) + 1],
  DATE '1985-01-01' + (gs * INTERVAL '120 days'),
  CONCAT('Bio for user ', gs),
  CONCAT('First', gs),
  CONCAT('Last', gs),
  ARRAY[CONCAT('+84-09', LPAD(gs::text, 3, '0'))],
  ARRAY[CONCAT('Address ', gs)],
  ARRAY[CONCAT('user', gs, '@example.com')],
  (ARRAY['Engineer', 'Manager', 'Analyst', 'Designer', 'Operator'])[((gs - 1) % 5) + 1],
  (ARRAY['R&D', 'Operations', 'Sales', 'Finance', 'HR'])[((gs - 1) % 5) + 1],
  NOW() - (gs || ' days')::INTERVAL,
  CONCAT((3000 + gs * 50), ' USD'),
  jsonb_build_object('line1', CONCAT('Street ', gs), 'city', 'Hanoi', 'country', 'VN'),
  CONCAT('Notes ', gs),
  (ARRAY['active', 'inactive', 'block'])[((gs - 1) % 3) + 1],
  gs % 2 = 0,
  NOW() - (gs || ' days')::INTERVAL,
  NOW(),
  NULL,
  NULL
FROM generate_series(1, 20) AS gs;

-- User login credentials
WITH user_rows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM "users"
  ORDER BY created_at, id
  LIMIT 20
)
INSERT INTO "users_login" (
  "user_id",
  "username",
  "email",
  "phone",
  "password_hash",
  "last_login_at",
  "last_login_ip",
  "last_login_user_agent",
  "last_login_location",
  "last_login_device",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  id,
  CONCAT('user', rn),
  CONCAT('user', rn, '@example.com'),
  CONCAT('+84-090', LPAD(rn::text, 3, '0')),
  '$2a$10$SeededBavaduPasswordHashExample000000000000000000000',
  NOW() - (rn || ' days')::INTERVAL,
  CONCAT('192.168.1.', rn),
  'Mozilla/5.0 (Seed Script)',
  'Hanoi, VN',
  CONCAT('Device-', rn),
  NOW() - (rn || ' days')::INTERVAL,
  NOW(),
  NULL,
  NULL
FROM user_rows
ON CONFLICT ("username") DO NOTHING;

-- Dynamic entities
INSERT INTO "dynamic_entities" (
  "code",
  "name",
  "description",
  "model",
  "data_type",
  "options",
  "default_value",
  "is_required",
  "validation",
  "use_in",
  "is_active",
  "order",
  "parent_id",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  CONCAT('DE', LPAD(gs::text, 3, '0')),
  jsonb_build_object('en', CONCAT('Dynamic Field ', gs), 'vi', CONCAT('Trường động ', gs)),
  jsonb_build_object('en', CONCAT('Description for dynamic field ', gs), 'vi', CONCAT('Mô tả cho trường ', gs)),
  (ARRAY['product', 'customer', 'supplier', 'order'])[((gs - 1) % 4) + 1],
  (ARRAY['string', 'number', 'boolean', 'date', 'select'])[((gs - 1) % 5) + 1],
  CASE
    WHEN gs % 5 = 0 THEN jsonb_build_array(jsonb_build_object('label', jsonb_build_object('en', 'Option A', 'vi', 'Tuỳ chọn A'), 'value', 'A'))
    ELSE NULL
  END,
  NULL,
  gs % 2 = 0,
  CASE WHEN gs % 3 = 0 THEN jsonb_build_array(jsonb_build_object('rule', 'required')) ELSE NULL END,
  jsonb_build_object('report', gs % 2 = 0, 'list', TRUE, 'filter', gs % 3 = 0),
  TRUE,
  gs,
  NULL,
  NOW(),
  NOW(),
  NULL,
  NULL
FROM generate_series(1, 20) AS gs;

-- Units of measure
INSERT INTO "units_of_measure" (
  "name",
  "symbol",
  "is_active",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  jsonb_build_object('en', CONCAT('Unit ', gs), 'vi', CONCAT('Đơn vị ', gs)),
  CONCAT('U', LPAD(gs::text, 2, '0')),
  gs % 5 <> 0,
  NOW() - (gs || ' days')::INTERVAL,
  NOW(),
  NULL,
  NULL
FROM generate_series(1, 20) AS gs;

-- Unit conversions
WITH uoms AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM "units_of_measure"
  ORDER BY created_at, id
  LIMIT 20
)
INSERT INTO "uom_conversions" (
  "uom_id",
  "conversion_ratio",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  id,
  1 + (rn::numeric / 10),
  NOW(),
  NOW(),
  NULL,
  NULL
FROM uoms;

-- Product categories (roots and children)
WITH roots AS (
  INSERT INTO "product_categories" (
    "code",
    "name",
    "description",
    "parent_id",
    "level",
    "is_active",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by"
  )
  SELECT
    CONCAT('CAT', LPAD(gs::text, 2, '0')),
    jsonb_build_object('en', CONCAT('Category ', gs), 'vi', CONCAT('Danh mục ', gs)),
    jsonb_build_object('en', CONCAT('Root category ', gs), 'vi', CONCAT('Danh mục gốc ', gs)),
    NULL,
    1,
    TRUE,
    NOW(),
    NOW(),
    NULL,
    NULL
  FROM generate_series(1, 5) AS gs
  RETURNING id, code
),
ranked_roots AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM roots
)
INSERT INTO "product_categories" (
  "code",
  "name",
  "description",
  "parent_id",
  "level",
  "is_active",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  CONCAT('CAT', LPAD((5 + gs)::text, 2, '0')),
  jsonb_build_object('en', CONCAT('Subcategory ', gs), 'vi', CONCAT('Danh mục con ', gs)),
  jsonb_build_object('en', CONCAT('Subcategory description ', gs), 'vi', CONCAT('Mô tả danh mục con ', gs)),
  (SELECT id FROM ranked_roots WHERE rn = ((gs - 1) % 5) + 1),
  2,
  TRUE,
  NOW(),
  NOW(),
  NULL,
  NULL
FROM generate_series(1, 15) AS gs;

-- Product masters
WITH cats AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "product_categories"
  ORDER BY code
  LIMIT 20
)
INSERT INTO "product_masters" (
  "code",
  "name",
  "image",
  "description",
  "type",
  "features",
  "is_active",
  "brand",
  "category_id",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  CONCAT('PROD', LPAD(rn::text, 3, '0')),
  jsonb_build_object('en', CONCAT('Product ', rn), 'vi', CONCAT('Sản phẩm ', rn)),
  CONCAT('https://picsum.photos/seed/product', rn, '/400/400'),
  jsonb_build_object('en', CONCAT('Product description ', rn), 'vi', CONCAT('Mô tả sản phẩm ', rn)),
  (ARRAY['goods', 'service', 'finished_good', 'raw_material', 'consumable', 'asset', 'tool'])[((rn - 1) % 7) + 1],
  jsonb_build_object(
    'sale', TRUE,
    'purchase', rn % 2 = 0,
    'manufacture', rn % 3 = 0,
    'stockable', rn % 4 <> 0
  ),
  TRUE,
  jsonb_build_object('en', CONCAT('Brand ', ((rn - 1) % 5) + 1), 'vi', CONCAT('Thương hiệu ', ((rn - 1) % 5) + 1)),
  id,
  NOW(),
  NOW(),
  NULL,
  NULL
FROM cats;

-- Product variants
WITH masters AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) AS rn
  FROM "product_masters"
  ORDER BY code
  LIMIT 20
),
uoms AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY symbol) AS rn
  FROM "units_of_measure"
  ORDER BY symbol
  LIMIT 20
)
INSERT INTO "product_variants" (
  "product_master_id",
  "name",
  "description",
  "images",
  "sku",
  "barcode",
  "manufacturer",
  "base_uom_id",
  "is_active",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  m.id,
  jsonb_build_object('en', CONCAT('Variant ', m.rn), 'vi', CONCAT('Biến thể ', m.rn)),
  jsonb_build_object('en', CONCAT('Variant description ', m.rn), 'vi', CONCAT('Mô tả biến thể ', m.rn)),
  jsonb_build_array(CONCAT('https://picsum.photos/seed/variant', m.rn, '/400/400')),
  CONCAT('SKU-', LPAD(m.rn::text, 4, '0')),
  CONCAT('BAR', LPAD((1000 + m.rn)::text, 6, '0')),
  jsonb_build_object(
    'name', jsonb_build_object('en', CONCAT('Manufacturer ', m.rn), 'vi', CONCAT('Nhà sản xuất ', m.rn)),
    'code', CONCAT('MFG', LPAD(m.rn::text, 3, '0'))
  ),
  u.id,
  TRUE,
  NOW(),
  NOW(),
  NULL,
  NULL
FROM masters m
JOIN uoms u ON u.rn = ((m.rn - 1) % 20) + 1;

-- Product packings
WITH variants AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM "product_variants"
  ORDER BY created_at, id
  LIMIT 20
)
INSERT INTO "product_packings" (
  "product_variant_id",
  "name",
  "description",
  "is_active",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  id,
  jsonb_build_object('en', CONCAT('Packing ', rn), 'vi', CONCAT('Đóng gói ', rn)),
  jsonb_build_object('en', CONCAT('Packing description ', rn), 'vi', CONCAT('Mô tả đóng gói ', rn)),
  TRUE,
  NOW(),
  NOW(),
  NULL,
  NULL
FROM variants;

-- Product attributes
WITH variant_rows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM "product_variants"
  ORDER BY created_at, id
  LIMIT 20
)
INSERT INTO "product_attributes" (
  "product_variant_id",
  "code",
  "name",
  "value",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  id,
  CONCAT('ATTR', LPAD(rn::text, 4, '0')),
  jsonb_build_object('en', CONCAT('Attribute ', rn), 'vi', CONCAT('Thuộc tính ', rn)),
  CONCAT('Value ', rn),
  NOW(),
  NOW(),
  NULL,
  NULL
FROM variant_rows;

-- Stock warehouses
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

-- Stock levels
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
INSERT INTO "stock_levels" (
  "product_id",
  "warehouse_id",
  "quantity",
  "reserved_quantity",
  "created_at",
  "updated_at"
)
SELECT
  p.id,
  w.id,
  (15 + p.rn * 2)::numeric,
  (p.rn % 5)::numeric,
  NOW(),
  NOW()
FROM products p
JOIN warehouses w ON w.rn = ((p.rn - 1) % 20) + 1;

-- Stock moves
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
INSERT INTO "stock_moves" (
  "product_id",
  "quantity",
  "type",
  "source_warehouse_id",
  "target_warehouse_id",
  "reference",
  "note",
  "created_at",
  "created_by"
)
SELECT
  p.id,
  (5 + p.rn)::numeric,
  (ARRAY['inbound', 'outbound', 'adjustment', 'transfer'])[((p.rn - 1) % 4) + 1],
  w_source.id,
  w_target.id,
  CONCAT('REF-', LPAD(p.rn::text, 4, '0')),
  CONCAT('Stock move note ', p.rn),
  NOW() - (p.rn || ' hours')::INTERVAL,
  CONCAT('system-user-', p.rn)
FROM products p
JOIN warehouses w_source ON w_source.rn = ((p.rn - 1) % 20) + 1
JOIN warehouses w_target ON w_target.rn = ((p.rn + 4 - 1) % 20) + 1;

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

