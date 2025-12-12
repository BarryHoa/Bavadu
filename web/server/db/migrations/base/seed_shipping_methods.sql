-- Seed: Shipping Methods for B2B and B2C
-- Seed dữ liệu mẫu cho shipping_methods

-- B2C Shipping Methods
INSERT INTO "md_base"."shipping_methods" (
  "code", "name", "description", "type", "base_fee", "is_active", "order", "created_at", "updated_at"
)
SELECT 
  'pickup',
  jsonb_build_object('en', 'Pickup', 'vi', 'Tự nhận'),
  jsonb_build_object('en', 'Customer picks up the order at the store', 'vi', 'Khách hàng tự đến cửa hàng nhận hàng'),
  'b2c', 0, true, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "md_base"."shipping_methods" WHERE "code" = 'pickup' AND "type" = 'b2c');

INSERT INTO "md_base"."shipping_methods" (
  "code", "name", "description", "type", "base_fee", "is_active", "order", "created_at", "updated_at"
)
SELECT 
  'standard-delivery-b2c',
  jsonb_build_object('en', 'Standard Delivery', 'vi', 'Giao hàng tiêu chuẩn'),
  jsonb_build_object('en', 'Standard delivery within 3-5 business days', 'vi', 'Giao hàng tiêu chuẩn trong vòng 3-5 ngày làm việc'),
  'b2c', 30000, true, 2, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "md_base"."shipping_methods" WHERE "code" = 'standard-delivery-b2c' AND "type" = 'b2c');

INSERT INTO "md_base"."shipping_methods" (
  "code", "name", "description", "type", "base_fee", "is_active", "order", "created_at", "updated_at"
)
SELECT 
  'express-delivery-b2c',
  jsonb_build_object('en', 'Express Delivery', 'vi', 'Giao hàng nhanh'),
  jsonb_build_object('en', 'Express delivery within 1-2 business days', 'vi', 'Giao hàng nhanh trong vòng 1-2 ngày làm việc'),
  'b2c', 50000, true, 3, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "md_base"."shipping_methods" WHERE "code" = 'express-delivery-b2c' AND "type" = 'b2c');

-- B2B Shipping Methods
INSERT INTO "md_base"."shipping_methods" (
  "code", "name", "description", "type", "base_fee", "is_active", "order", "created_at", "updated_at"
)
SELECT 
  'standard-delivery-b2b',
  jsonb_build_object('en', 'Standard Delivery', 'vi', 'Giao hàng tiêu chuẩn'),
  jsonb_build_object('en', 'Standard delivery for B2B orders within 5-7 business days', 'vi', 'Giao hàng tiêu chuẩn cho đơn hàng B2B trong vòng 5-7 ngày làm việc'),
  'b2b', 100000, true, 4, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "md_base"."shipping_methods" WHERE "code" = 'standard-delivery-b2b' AND "type" = 'b2b');

INSERT INTO "md_base"."shipping_methods" (
  "code", "name", "description", "type", "base_fee", "is_active", "order", "created_at", "updated_at"
)
SELECT 
  'internal-delivery-b2b',
  jsonb_build_object('en', 'Internal Delivery', 'vi', 'Giao hàng nội bộ'),
  jsonb_build_object('en', 'Internal delivery using company vehicles for B2B orders', 'vi', 'Giao hàng nội bộ sử dụng phương tiện của công ty cho đơn hàng B2B'),
  'b2b-internal', 50000, true, 5, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "md_base"."shipping_methods" WHERE "code" = 'internal-delivery-b2b' AND "type" = 'b2b-internal');

INSERT INTO "md_base"."shipping_methods" (
  "code", "name", "description", "type", "base_fee", "is_active", "order", "created_at", "updated_at"
)
SELECT 
  'external-delivery-b2b',
  jsonb_build_object('en', 'External Delivery', 'vi', 'Giao hàng bên ngoài'),
  jsonb_build_object('en', 'External delivery using third-party logistics for B2B orders', 'vi', 'Giao hàng bên ngoài sử dụng dịch vụ logistics bên thứ ba cho đơn hàng B2B'),
  'b2b-external', 150000, true, 6, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "md_base"."shipping_methods" WHERE "code" = 'external-delivery-b2b' AND "type" = 'b2b-external');

-- All (Dùng chung cho cả B2B và B2C)
INSERT INTO "md_base"."shipping_methods" (
  "code", "name", "description", "type", "base_fee", "is_active", "order", "created_at", "updated_at"
)
SELECT 
  'standard-delivery-all',
  jsonb_build_object('en', 'Standard Delivery', 'vi', 'Giao hàng tiêu chuẩn'),
  jsonb_build_object('en', 'Standard delivery available for both B2B and B2C orders', 'vi', 'Giao hàng tiêu chuẩn dùng cho cả đơn hàng B2B và B2C'),
  'all', 50000, true, 7, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "md_base"."shipping_methods" WHERE "code" = 'standard-delivery-all' AND "type" = 'all');

