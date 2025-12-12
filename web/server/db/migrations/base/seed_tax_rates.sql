-- Seed: Tax Rates for B2B and B2C
-- Seed dữ liệu mẫu cho tax_rates

-- B2C Tax Rates
INSERT INTO "md_base"."tax_rates" (
  "code",
  "name",
  "description",
  "type",
  "rate",
  "is_active",
  "order",
  "created_at",
  "updated_at"
)
VALUES
  ('VAT_0', 
   jsonb_build_object('en', 'VAT 0%', 'vi', 'VAT 0%'),
   jsonb_build_object('en', 'Zero VAT rate', 'vi', 'Thuế VAT 0%'),
   'b2c', 0.00, true, 1, NOW(), NOW()),
  ('VAT_5', 
   jsonb_build_object('en', 'VAT 5%', 'vi', 'VAT 5%'),
   jsonb_build_object('en', 'VAT rate 5%', 'vi', 'Thuế VAT 5%'),
   'b2c', 5.00, true, 2, NOW(), NOW()),
  ('VAT_10', 
   jsonb_build_object('en', 'VAT 10%', 'vi', 'VAT 10%'),
   jsonb_build_object('en', 'VAT rate 10%', 'vi', 'Thuế VAT 10%'),
   'b2c', 10.00, true, 3, NOW(), NOW())
ON CONFLICT ("code", "type") DO NOTHING;

-- B2B Tax Rates
INSERT INTO "md_base"."tax_rates" (
  "code",
  "name",
  "description",
  "type",
  "rate",
  "is_active",
  "order",
  "created_at",
  "updated_at"
)
VALUES
  ('VAT_0', 
   jsonb_build_object('en', 'VAT 0%', 'vi', 'VAT 0%'),
   jsonb_build_object('en', 'Zero VAT rate', 'vi', 'Thuế VAT 0%'),
   'b2b', 0.00, true, 1, NOW(), NOW()),
  ('VAT_5', 
   jsonb_build_object('en', 'VAT 5%', 'vi', 'VAT 5%'),
   jsonb_build_object('en', 'VAT rate 5%', 'vi', 'Thuế VAT 5%'),
   'b2b', 5.00, true, 2, NOW(), NOW()),
  ('VAT_10', 
   jsonb_build_object('en', 'VAT 10%', 'vi', 'VAT 10%'),
   jsonb_build_object('en', 'VAT rate 10%', 'vi', 'Thuế VAT 10%'),
   'b2b', 10.00, true, 3, NOW(), NOW()),
  ('NO_TAX', 
   jsonb_build_object('en', 'No Tax', 'vi', 'Không thuế'),
   jsonb_build_object('en', 'No tax applied', 'vi', 'Không áp dụng thuế'),
   'b2b', 0.00, true, 4, NOW(), NOW())
ON CONFLICT ("code", "type") DO NOTHING;

-- All (Common) Tax Rates
INSERT INTO "md_base"."tax_rates" (
  "code",
  "name",
  "description",
  "type",
  "rate",
  "is_active",
  "order",
  "created_at",
  "updated_at"
)
VALUES
  ('VAT_0', 
   jsonb_build_object('en', 'VAT 0%', 'vi', 'VAT 0%'),
   jsonb_build_object('en', 'Zero VAT rate', 'vi', 'Thuế VAT 0%'),
   'all', 0.00, true, 1, NOW(), NOW()),
  ('VAT_10', 
   jsonb_build_object('en', 'VAT 10%', 'vi', 'VAT 10%'),
   jsonb_build_object('en', 'VAT rate 10%', 'vi', 'Thuế VAT 10%'),
   'all', 10.00, true, 2, NOW(), NOW())
ON CONFLICT ("code", "type") DO NOTHING;
