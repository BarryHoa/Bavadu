-- Seed: Shipping Terms for B2B and B2C
-- Seed dữ liệu mẫu cho shipping_terms

-- B2C Shipping Terms
INSERT INTO "md_base"."shipping_terms" (
  "code",
  "name",
  "description",
  "type",
  "is_active",
  "order",
  "created_at",
  "updated_at"
)
VALUES
  ('COD', 
   jsonb_build_object('en', 'Cash on Delivery', 'vi', 'Thanh toán khi nhận hàng'),
   jsonb_build_object('en', 'Customer pays when receiving the goods', 'vi', 'Khách hàng thanh toán khi nhận hàng'),
   'b2c', true, 1, NOW(), NOW()),
  ('PREPAID', 
   jsonb_build_object('en', 'Prepaid Shipping', 'vi', 'Giao hàng trả trước'),
   jsonb_build_object('en', 'Shipping fee paid in advance', 'vi', 'Phí vận chuyển được thanh toán trước'),
   'b2c', true, 2, NOW(), NOW()),
  ('FREE', 
   jsonb_build_object('en', 'Free Shipping', 'vi', 'Miễn phí vận chuyển'),
   jsonb_build_object('en', 'Free shipping for customer', 'vi', 'Miễn phí vận chuyển cho khách hàng'),
   'b2c', true, 3, NOW(), NOW())
ON CONFLICT ("code", "type") DO NOTHING;

-- B2B Shipping Terms
INSERT INTO "md_base"."shipping_terms" (
  "code",
  "name",
  "description",
  "type",
  "is_active",
  "order",
  "created_at",
  "updated_at"
)
VALUES
  ('FOB', 
   jsonb_build_object('en', 'Free On Board', 'vi', 'Giao hàng lên tàu'),
   jsonb_build_object('en', 'Seller delivers goods on board the vessel', 'vi', 'Người bán giao hàng lên tàu'),
   'b2b', true, 1, NOW(), NOW()),
  ('CIF', 
   jsonb_build_object('en', 'Cost, Insurance and Freight', 'vi', 'Giá, bảo hiểm và cước phí'),
   jsonb_build_object('en', 'Seller pays for cost, insurance and freight', 'vi', 'Người bán trả chi phí, bảo hiểm và cước phí'),
   'b2b', true, 2, NOW(), NOW()),
  ('EXW', 
   jsonb_build_object('en', 'Ex Works', 'vi', 'Giao tại xưởng'),
   jsonb_build_object('en', 'Buyer collects goods at seller location', 'vi', 'Người mua nhận hàng tại địa điểm người bán'),
   'b2b', true, 3, NOW(), NOW()),
  ('DDP', 
   jsonb_build_object('en', 'Delivered Duty Paid', 'vi', 'Giao hàng đã nộp thuế'),
   jsonb_build_object('en', 'Seller delivers and pays all duties', 'vi', 'Người bán giao hàng và trả tất cả thuế'),
   'b2b', true, 4, NOW(), NOW()),
  ('NET30', 
   jsonb_build_object('en', 'Net 30 Days', 'vi', 'Thanh toán sau 30 ngày'),
   jsonb_build_object('en', 'Payment due within 30 days', 'vi', 'Thanh toán trong vòng 30 ngày'),
   'b2b', true, 5, NOW(), NOW())
ON CONFLICT ("code", "type") DO NOTHING;

-- All (Common) Shipping Terms
INSERT INTO "md_base"."shipping_terms" (
  "code",
  "name",
  "description",
  "type",
  "is_active",
  "order",
  "created_at",
  "updated_at"
)
VALUES
  ('STANDARD', 
   jsonb_build_object('en', 'Standard Shipping', 'vi', 'Vận chuyển tiêu chuẩn'),
   jsonb_build_object('en', 'Standard shipping method', 'vi', 'Phương thức vận chuyển tiêu chuẩn'),
   'all', true, 1, NOW(), NOW()),
  ('EXPRESS', 
   jsonb_build_object('en', 'Express Shipping', 'vi', 'Vận chuyển nhanh'),
   jsonb_build_object('en', 'Express delivery service', 'vi', 'Dịch vụ giao hàng nhanh'),
   'all', true, 2, NOW(), NOW())
ON CONFLICT ("code", "type") DO NOTHING;
