-- Migration: Update Price Lists B2C Constraints
-- Cập nhật constraints và validation rules cho B2C pricing system

-- ============================================
-- 1. Thêm field apply_to_exceptions vào pricing_rules_b2c
-- ============================================
ALTER TABLE "pricing_rules_b2c"
ADD COLUMN IF NOT EXISTS "apply_to_exceptions" boolean DEFAULT false NOT NULL;

COMMENT ON COLUMN "pricing_rules_b2c"."apply_to_exceptions" IS 
'Áp dụng cho sản phẩm ngoại lệ (explicit pricing items). false: Rule chỉ áp dụng cho sản phẩm KHÔNG có explicit pricing. true: Rule áp dụng cho TẤT CẢ sản phẩm (kể cả có explicit pricing)';

-- ============================================
-- 2. Cập nhật valid_from thành NOT NULL
-- ============================================
-- Cập nhật các record NULL thành giá trị mặc định (created_at hoặc now())
UPDATE "price_lists_b2c"
SET "valid_from" = COALESCE("created_at", now())
WHERE "valid_from" IS NULL;

ALTER TABLE "price_lists_b2c"
ALTER COLUMN "valid_from" SET NOT NULL;

-- ============================================
-- 3. Cập nhật applicable_to thành NOT NULL
-- ============================================
-- Cập nhật các record NULL thành giá trị mặc định (empty object)
UPDATE "price_lists_b2c"
SET "applicable_to" = '{}'::jsonb
WHERE "applicable_to" IS NULL;

ALTER TABLE "price_lists_b2c"
ALTER COLUMN "applicable_to" SET NOT NULL;

-- ============================================
-- 4. Thêm check constraints
-- ============================================
-- Check: validTo phải >= validFrom (nếu có)
ALTER TABLE "price_lists_b2c"
ADD CONSTRAINT "price_lists_b2c_valid_dates_check" 
CHECK (("valid_to" IS NULL) OR ("valid_to" >= "valid_from"));

-- Check: Nếu type != 'standard' thì validTo không được NULL
ALTER TABLE "price_lists_b2c"
ADD CONSTRAINT "price_lists_b2c_valid_to_required_check" 
CHECK (("type" = 'standard') OR ("valid_to" IS NOT NULL));

-- ============================================
-- 5. Tạo index cho applicable_to
-- ============================================
CREATE INDEX IF NOT EXISTS "idx_price_lists_b2c_applicable_to" 
ON "price_lists_b2c" USING GIN ("applicable_to");

CREATE INDEX IF NOT EXISTS "idx_price_lists_b2c_type_status" 
ON "price_lists_b2c"("type", "status");

-- ============================================
-- 6. Tạo function để validate không trùng valid dates cho standard price lists
-- ============================================
CREATE OR REPLACE FUNCTION check_standard_price_list_overlap()
RETURNS TRIGGER AS $$
DECLARE
  overlapping_count INTEGER;
  applicable_to_json JSONB;
BEGIN
  -- Chỉ kiểm tra cho standard price lists đang active
  IF NEW.type = 'standard' AND NEW.status = 'active' THEN
    applicable_to_json := NEW.applicable_to;
    
    -- Kiểm tra xem có standard price list nào khác (không phải record hiện tại)
    -- có cùng applicableTo và trùng valid dates không
    SELECT COUNT(*) INTO overlapping_count
    FROM "price_lists_b2c"
    WHERE "id" != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND "type" = 'standard'
      AND "status" = 'active'
      AND "applicable_to" = applicable_to_json
      AND (
        -- Trường hợp 1: validTo của record mới là NULL (mãi mãi)
        -- -> Không được phép có record nào khác với cùng applicableTo
        (NEW."valid_to" IS NULL) OR
        -- Trường hợp 2: Có overlap về thời gian
        (
          -- Record mới bắt đầu trong khoảng thời gian của record cũ
          (NEW."valid_from" >= "valid_from" AND 
           (NEW."valid_from" <= COALESCE("valid_to", '9999-12-31'::timestamp))) OR
          -- Record mới kết thúc trong khoảng thời gian của record cũ
          (NEW."valid_to" IS NOT NULL AND
           NEW."valid_to" >= "valid_from" AND
           (NEW."valid_to" <= COALESCE("valid_to", '9999-12-31'::timestamp))) OR
          -- Record cũ nằm hoàn toàn trong record mới
          ("valid_from" >= NEW."valid_from" AND
           (NEW."valid_to" IS NULL OR COALESCE("valid_to", '9999-12-31'::timestamp) <= NEW."valid_to"))
        )
      );
    
    IF overlapping_count > 0 THEN
      RAISE EXCEPTION 'Không được phép tạo bảng giá standard với cùng applicableTo và trùng thời gian áp dụng. Vui lòng kiểm tra valid_from và valid_to.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Tạo trigger để gọi function validation
-- ============================================
DROP TRIGGER IF EXISTS "trigger_check_standard_price_list_overlap" ON "price_lists_b2c";

CREATE TRIGGER "trigger_check_standard_price_list_overlap"
BEFORE INSERT OR UPDATE ON "price_lists_b2c"
FOR EACH ROW
EXECUTE FUNCTION check_standard_price_list_overlap();

-- ============================================
-- 8. Tạo function để validate ít nhất 1 bảng giá standard đang active
-- ============================================
CREATE OR REPLACE FUNCTION check_at_least_one_active_standard_price_list()
RETURNS TRIGGER AS $$
DECLARE
  active_standard_count INTEGER;
BEGIN
  -- Nếu đang xóa hoặc deactivate một standard price list
  IF (TG_OP = 'DELETE' AND OLD.type = 'standard' AND OLD.status = 'active') OR
     (TG_OP = 'UPDATE' AND OLD.type = 'standard' AND OLD.status = 'active' AND 
      (NEW.status != 'active' OR NEW.type != 'standard')) THEN
    
    -- Đếm số standard price list còn lại đang active
    SELECT COUNT(*) INTO active_standard_count
    FROM "price_lists_b2c"
    WHERE "type" = 'standard'
      AND "status" = 'active'
      AND "id" != COALESCE(OLD.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
    IF active_standard_count = 0 THEN
      RAISE EXCEPTION 'Hệ thống bắt buộc phải có ít nhất 1 bảng giá standard đang active.';
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. Tạo trigger để validate ít nhất 1 standard price list active
-- ============================================
DROP TRIGGER IF EXISTS "trigger_check_at_least_one_active_standard" ON "price_lists_b2c";

CREATE TRIGGER "trigger_check_at_least_one_active_standard"
BEFORE DELETE OR UPDATE ON "price_lists_b2c"
FOR EACH ROW
EXECUTE FUNCTION check_at_least_one_active_standard_price_list();

-- ============================================
-- 10. Comment cho các columns
-- ============================================
COMMENT ON COLUMN "price_lists_b2c"."valid_from" IS 'Thời gian bắt đầu áp dụng - Bắt buộc';
COMMENT ON COLUMN "price_lists_b2c"."valid_to" IS 'Thời gian kết thúc áp dụng - NULL = mãi mãi (chỉ cho standard type)';
COMMENT ON COLUMN "price_lists_b2c"."applicable_to" IS 'Điều kiện áp dụng: {channels?: string[], stores?: string[], locations?: string[], regions?: string[], customerGroups?: string[]} - Bắt buộc';
COMMENT ON COLUMN "price_lists_b2c"."currency_id" IS 'Currency ID - Mặc định VND';

