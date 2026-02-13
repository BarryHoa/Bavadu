-- Migration: Seed default units of measure
-- Tạo các đơn vị tính mặc định cho sản phẩm

INSERT INTO "mdl_product"."units_of_measure" ("name", "symbol", "is_active", "created_at", "updated_at")
SELECT jsonb_build_object('en', 'Piece', 'vi', 'Cái'), 'cái', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "mdl_product"."units_of_measure" WHERE "symbol" = 'cái');

INSERT INTO "mdl_product"."units_of_measure" ("name", "symbol", "is_active", "created_at", "updated_at")
SELECT jsonb_build_object('en', 'Kilogram', 'vi', 'Kilôgam'), 'kg', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "mdl_product"."units_of_measure" WHERE "symbol" = 'kg');

INSERT INTO "mdl_product"."units_of_measure" ("name", "symbol", "is_active", "created_at", "updated_at")
SELECT jsonb_build_object('en', 'Box', 'vi', 'Hộp'), 'hộp', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "mdl_product"."units_of_measure" WHERE "symbol" = 'hộp');

INSERT INTO "mdl_product"."units_of_measure" ("name", "symbol", "is_active", "created_at", "updated_at")
SELECT jsonb_build_object('en', 'Pack', 'vi', 'Thùng'), 'thùng', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "mdl_product"."units_of_measure" WHERE "symbol" = 'thùng');

INSERT INTO "mdl_product"."units_of_measure" ("name", "symbol", "is_active", "created_at", "updated_at")
SELECT jsonb_build_object('en', 'Meter', 'vi', 'Mét'), 'm', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "mdl_product"."units_of_measure" WHERE "symbol" = 'm');

INSERT INTO "mdl_product"."units_of_measure" ("name", "symbol", "is_active", "created_at", "updated_at")
SELECT jsonb_build_object('en', 'Liter', 'vi', 'Lít'), 'L', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "mdl_product"."units_of_measure" WHERE "symbol" = 'L');
