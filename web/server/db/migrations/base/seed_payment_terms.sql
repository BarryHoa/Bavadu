-- Seed: Payment Terms for B2B and B2C
-- Seed dữ liệu mẫu cho payment_terms

-- B2C Payment Terms
INSERT INTO "md_base"."payment_terms" (
  "code",
  "name",
  "description",
  "type",
  "days",
  "is_active",
  "order",
  "created_at",
  "updated_at"
)
VALUES
  ('COD', 
   jsonb_build_object('en', 'Cash on Delivery', 'vi', 'Thanh toán khi nhận hàng'),
   jsonb_build_object('en', 'Pay when receiving goods', 'vi', 'Thanh toán khi nhận hàng'),
   'b2c', 0, true, 1, NOW(), NOW()),
  ('PREPAID', 
   jsonb_build_object('en', 'Prepaid', 'vi', 'Trả trước'),
   jsonb_build_object('en', 'Payment in advance', 'vi', 'Thanh toán trước'),
   'b2c', 0, true, 2, NOW(), NOW()),
  ('INSTANT', 
   jsonb_build_object('en', 'Instant Payment', 'vi', 'Thanh toán ngay'),
   jsonb_build_object('en', 'Immediate payment required', 'vi', 'Yêu cầu thanh toán ngay lập tức'),
   'b2c', 0, true, 3, NOW(), NOW())
ON CONFLICT ("code", "type") DO NOTHING;

-- B2B Payment Terms
INSERT INTO "md_base"."payment_terms" (
  "code",
  "name",
  "description",
  "type",
  "days",
  "is_active",
  "order",
  "created_at",
  "updated_at"
)
VALUES
  ('NET15', 
   jsonb_build_object('en', 'Net 15 Days', 'vi', 'Thanh toán sau 15 ngày'),
   jsonb_build_object('en', 'Payment due within 15 days', 'vi', 'Thanh toán trong vòng 15 ngày'),
   'b2b', 15, true, 1, NOW(), NOW()),
  ('NET30', 
   jsonb_build_object('en', 'Net 30 Days', 'vi', 'Thanh toán sau 30 ngày'),
   jsonb_build_object('en', 'Payment due within 30 days', 'vi', 'Thanh toán trong vòng 30 ngày'),
   'b2b', 30, true, 2, NOW(), NOW()),
  ('NET45', 
   jsonb_build_object('en', 'Net 45 Days', 'vi', 'Thanh toán sau 45 ngày'),
   jsonb_build_object('en', 'Payment due within 45 days', 'vi', 'Thanh toán trong vòng 45 ngày'),
   'b2b', 45, true, 3, NOW(), NOW()),
  ('NET60', 
   jsonb_build_object('en', 'Net 60 Days', 'vi', 'Thanh toán sau 60 ngày'),
   jsonb_build_object('en', 'Payment due within 60 days', 'vi', 'Thanh toán trong vòng 60 ngày'),
   'b2b', 60, true, 4, NOW(), NOW()),
  ('NET90', 
   jsonb_build_object('en', 'Net 90 Days', 'vi', 'Thanh toán sau 90 ngày'),
   jsonb_build_object('en', 'Payment due within 90 days', 'vi', 'Thanh toán trong vòng 90 ngày'),
   'b2b', 90, true, 5, NOW(), NOW()),
  ('IMMEDIATE', 
   jsonb_build_object('en', 'Immediate Payment', 'vi', 'Thanh toán ngay'),
   jsonb_build_object('en', 'Payment required immediately', 'vi', 'Yêu cầu thanh toán ngay lập tức'),
   'b2b', 0, true, 6, NOW(), NOW())
ON CONFLICT ("code", "type") DO NOTHING;

-- All (Common) Payment Terms
INSERT INTO "md_base"."payment_terms" (
  "code",
  "name",
  "description",
  "type",
  "days",
  "is_active",
  "order",
  "created_at",
  "updated_at"
)
VALUES
  ('CASH', 
   jsonb_build_object('en', 'Cash Payment', 'vi', 'Thanh toán tiền mặt'),
   jsonb_build_object('en', 'Cash payment method', 'vi', 'Phương thức thanh toán tiền mặt'),
   'all', 0, true, 1, NOW(), NOW()),
  ('BANK_TRANSFER', 
   jsonb_build_object('en', 'Bank Transfer', 'vi', 'Chuyển khoản ngân hàng'),
   jsonb_build_object('en', 'Payment via bank transfer', 'vi', 'Thanh toán qua chuyển khoản ngân hàng'),
   'all', 0, true, 2, NOW(), NOW())
ON CONFLICT ("code", "type") DO NOTHING;
