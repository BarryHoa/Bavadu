-- Seed: Payment Methods for B2B and B2C
-- Seed dữ liệu mẫu cho payment_methods

-- B2C Payment Methods
INSERT INTO "md_base"."payment_methods" (
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
   jsonb_build_object('en', 'Pay cash when receiving goods', 'vi', 'Thanh toán tiền mặt khi nhận hàng'),
   'b2c', true, 1, NOW(), NOW()),
  ('CREDIT_CARD', 
   jsonb_build_object('en', 'Credit Card', 'vi', 'Thẻ tín dụng'),
   jsonb_build_object('en', 'Payment by credit card', 'vi', 'Thanh toán bằng thẻ tín dụng'),
   'b2c', true, 2, NOW(), NOW()),
  ('DEBIT_CARD', 
   jsonb_build_object('en', 'Debit Card', 'vi', 'Thẻ ghi nợ'),
   jsonb_build_object('en', 'Payment by debit card', 'vi', 'Thanh toán bằng thẻ ghi nợ'),
   'b2c', true, 3, NOW(), NOW()),
  ('E_WALLET', 
   jsonb_build_object('en', 'E-Wallet', 'vi', 'Ví điện tử'),
   jsonb_build_object('en', 'Payment via e-wallet (MoMo, ZaloPay, etc.)', 'vi', 'Thanh toán qua ví điện tử (MoMo, ZaloPay, v.v.)'),
   'b2c', true, 4, NOW(), NOW()),
  ('BANK_TRANSFER', 
   jsonb_build_object('en', 'Bank Transfer', 'vi', 'Chuyển khoản ngân hàng'),
   jsonb_build_object('en', 'Payment via bank transfer', 'vi', 'Thanh toán qua chuyển khoản ngân hàng'),
   'b2c', true, 5, NOW(), NOW())
ON CONFLICT ("code", "type") DO NOTHING;

-- B2B Payment Methods
INSERT INTO "md_base"."payment_methods" (
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
  ('BANK_TRANSFER', 
   jsonb_build_object('en', 'Bank Transfer', 'vi', 'Chuyển khoản ngân hàng'),
   jsonb_build_object('en', 'Payment via bank transfer', 'vi', 'Thanh toán qua chuyển khoản ngân hàng'),
   'b2b', true, 1, NOW(), NOW()),
  ('LETTER_OF_CREDIT', 
   jsonb_build_object('en', 'Letter of Credit', 'vi', 'Thư tín dụng'),
   jsonb_build_object('en', 'Payment via letter of credit', 'vi', 'Thanh toán qua thư tín dụng'),
   'b2b', true, 2, NOW(), NOW()),
  ('CREDIT_ACCOUNT', 
   jsonb_build_object('en', 'Credit Account', 'vi', 'Tài khoản tín dụng'),
   jsonb_build_object('en', 'Payment via credit account', 'vi', 'Thanh toán qua tài khoản tín dụng'),
   'b2b', true, 3, NOW(), NOW()),
  ('CHEQUE', 
   jsonb_build_object('en', 'Cheque', 'vi', 'Séc'),
   jsonb_build_object('en', 'Payment by cheque', 'vi', 'Thanh toán bằng séc'),
   'b2b', true, 4, NOW(), NOW())
ON CONFLICT ("code", "type") DO NOTHING;

-- All (Common) Payment Methods
INSERT INTO "md_base"."payment_methods" (
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
  ('CASH', 
   jsonb_build_object('en', 'Cash', 'vi', 'Tiền mặt'),
   jsonb_build_object('en', 'Cash payment', 'vi', 'Thanh toán tiền mặt'),
   'all', true, 1, NOW(), NOW()),
  ('BANK_TRANSFER', 
   jsonb_build_object('en', 'Bank Transfer', 'vi', 'Chuyển khoản ngân hàng'),
   jsonb_build_object('en', 'Payment via bank transfer', 'vi', 'Thanh toán qua chuyển khoản ngân hàng'),
   'all', true, 2, NOW(), NOW())
ON CONFLICT ("code", "type") DO NOTHING;
