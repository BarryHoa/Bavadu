# Product Features Constraints by Type

Tài liệu này mô tả các ràng buộc giữa `ProductMasterType` và `ProductMasterFeatures`.

## 📋 Tổng quan

Mỗi loại sản phẩm có các ràng buộc logic về features:
- **Required features**: Phải là `true`
- **Forbidden features**: Phải là `false`
- **Default features**: Giá trị mặc định khi tạo mới

---

## 🔍 Chi tiết theo từng loại

### 1. GOODS - Hàng hóa mua bán

**Required:**
- ✅ `sale: true` - Có thể bán
- ✅ `purchase: true` - Có thể mua
- ✅ `stockable: true` - Có thể lưu kho

**Forbidden:**
- ❌ `manufacture: false` - Không sản xuất
- ❌ `subcontract: false` - Không gia công
- ❌ `maintenance: false` - Không bảo trì
- ❌ `asset: false` - Không phải tài sản
- ❌ `accounting: false` - Không khấu hao

**Ví dụ:** Bánh kẹo, giỏ xách, lẵng hoa

---

### 2. SERVICE - Dịch vụ

**Required:**
- ✅ `sale: true` - Có thể bán
- ✅ `purchase: true` - Có thể mua dịch vụ từ nhà cung cấp

**Forbidden:**
- ❌ `stockable: false` - **QUAN TRỌNG: Service không tồn kho**
- ❌ `manufacture: false` - Không sản xuất
- ❌ `subcontract: false` - Không gia công
- ❌ `maintenance: false` - Không bảo trì
- ❌ `asset: false` - Không phải tài sản
- ❌ `accounting: false` - Không khấu hao

**Ví dụ:** Dịch vụ tư vấn, dịch vụ vận chuyển

---

### 3. FINISHED_GOOD - Thành phẩm sản xuất

**Required:**
- ✅ `sale: true` - Có thể bán
- ✅ `stockable: true` - Có thể lưu kho
- ✅ `manufacture: true` - Có thể sản xuất

**Forbidden:**
- ❌ `purchase: false` - **Không mua thành phẩm (tự sản xuất)**

**Optional:**
- `subcontract: true` - Có thể gia công ngoài

**Ví dụ:** Thành phẩm từ sản xuất

---

### 4. RAW_MATERIAL - Nguyên vật liệu

**Required:**
- ✅ `purchase: true` - Có thể mua
- ✅ `stockable: true` - Có thể lưu kho

**Forbidden:**
- ❌ `sale: false` - **Không bán nguyên vật liệu (dùng nội bộ)**

**Optional:**
- `manufacture: true` - Có thể tự sản xuất nguyên vật liệu

**Ví dụ:** Nguyên vật liệu sản xuất

---

### 5. CONSUMABLE - Vật tư tiêu hao

**Required:**
- ✅ `purchase: true` - Có thể mua
- ✅ `stockable: true` - Có thể lưu kho

**Forbidden:**
- ❌ `sale: false` - **Không bán (dùng nội bộ)**
- ❌ `manufacture: false` - Không sản xuất
- ❌ `subcontract: false` - Không gia công
- ❌ `maintenance: false` - Không bảo trì
- ❌ `asset: false` - Không phải tài sản
- ❌ `accounting: false` - Không khấu hao

**Ví dụ:** Băng keo, viết, giấy in

---

### 6. TOOL - Công cụ/Thiết bị

**Required:**
- ✅ `purchase: true` - Có thể mua
- ✅ `stockable: true` - Có thể lưu kho
- ✅ `maintenance: true` - **Có thể bảo trì**

**Forbidden:**
- ❌ `sale: false` - **Không bán (dùng nội bộ)**
- ❌ `manufacture: false` - Không sản xuất
- ❌ `subcontract: false` - Không gia công
- ❌ `asset: false` - Không phải tài sản cố định
- ❌ `accounting: false` - Không khấu hao

**Ví dụ:** Máy in, máy post

---

### 7. ASSET - Tài sản cố định

**Required:**
- ✅ `purchase: true` - Có thể mua
- ✅ `stockable: true` - Có thể lưu kho
- ✅ `asset: true` - **Là tài sản**
- ✅ `accounting: true` - **Có khấu hao**
- ✅ `maintenance: true` - Có thể bảo trì

**Forbidden:**
- ❌ `sale: false` - **Không bán (tài sản cố định)**
- ❌ `manufacture: false` - Không sản xuất
- ❌ `subcontract: false` - Không gia công

**Ví dụ:** Tài sản cố định, CCDC

---

## 🔧 Implementation

### Utility Functions

File: `modules/product/server/utils/product-features-validator.ts`

**Functions:**
1. `getDefaultFeaturesForType(type)` - Lấy features mặc định
2. `validateProductFeatures(type, features)` - Validate features
3. `normalizeProductFeatures(type, userFeatures)` - Normalize và merge với defaults

### Usage in Controllers

```typescript
import {
  normalizeProductFeatures,
  validateProductFeatures,
} from "../../utils/product-features-validator";

// Normalize features
const normalizedFeatures = normalizeProductFeatures(type, userFeatures);

// Validate
const errors = validateProductFeatures(type, normalizedFeatures);
if (errors.length > 0) {
  throw new Error(errors.join(", "));
}
```

---

## ⚠️ Important Notes

1. **Service không tồn kho**: `stockable` phải là `false` cho service
2. **Asset có khấu hao**: `asset` và `accounting` phải là `true` cho asset
3. **Tool cần bảo trì**: `maintenance` phải là `true` cho tool
4. **Finished Good không mua**: `purchase` phải là `false` cho finished_good
5. **Raw Material không bán**: `sale` phải là `false` cho raw_material

---

## 📊 Summary Table

| Type | sale | purchase | stockable | manufacture | maintenance | asset | accounting |
|------|------|----------|-----------|-------------|-------------|-------|------------|
| goods | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| service | ✅ | ✅ | **❌** | ❌ | ❌ | ❌ | ❌ |
| finished_good | ✅ | **❌** | ✅ | ✅ | ❌ | ❌ | ❌ |
| raw_material | **❌** | ✅ | ✅ | ⚪ | ❌ | ❌ | ❌ |
| consumable | **❌** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| tool | **❌** | ✅ | ✅ | ❌ | **✅** | ❌ | ❌ |
| asset | **❌** | ✅ | ✅ | ❌ | ✅ | **✅** | **✅** |

Legend:
- ✅ = Required (must be true)
- ❌ = Forbidden (must be false)
- ⚪ = Optional

