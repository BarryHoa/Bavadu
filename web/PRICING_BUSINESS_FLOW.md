# Flow Nghiệp Vụ - Hệ Thống Bảng Giá B2C

## 📋 Tổng Quan

Hệ thống bảng giá B2C hoạt động theo mô hình: **1 SO = 1 Price List + Rules/Promotions + Manual Override**

## ⚠️ Rules & Constraints Bắt Buộc

### 1. Bảng Giá Bắt Buộc

- **Hệ thống bắt buộc phải có ít nhất 1 bảng giá standard đang active**
- Không được phép xóa hoặc deactivate bảng giá standard cuối cùng

### 2. Điều Kiện Áp Dụng (Applicable To)

- Mỗi bảng giá **bắt buộc** phải có `applicableTo` với cấu trúc:
  ```json
  {
    "channels": ["online", "offline", "mobile_app"],
    "stores": ["store-id-1", "store-id-2"],
    "locations": ["hcm", "hn", "dn"],
    "regions": ["north", "south", "central"],
    "customerGroups": ["vip", "regular"]
  }
  ```
- Phải có ít nhất một trong các điều kiện trên

### 3. Thời Gian Áp Dụng

- `validFrom`: **Bắt buộc** (không được NULL)
- `validTo`:
  - **Standard type**: Có thể NULL (mãi mãi, không bao giờ hết hạn)
  - **Khác standard**: Bắt buộc phải có (không được NULL)
- `validTo` phải >= `validFrom` (nếu có)

### 4. Currency

- **Luôn luôn áp dụng currency là VND** (mặc định)

### 5. Pricing Rules & Sản Phẩm Ngoại Lệ

- **Sản phẩm ngoại lệ**: Sản phẩm có explicit pricing trong `price_list_items_b2c`
- **Rule mặc định**: Chỉ áp dụng cho sản phẩm **KHÔNG có** explicit pricing
- **Field `applyToExceptions`**:
  - `false` (mặc định): Rule chỉ áp dụng cho sản phẩm không có explicit pricing
  - `true`: Rule áp dụng cho **TẤT CẢ** sản phẩm (kể cả có explicit pricing)

### 6. Ràng Buộc Standard Price Lists

- **Không được trùng valid dates** cho standard price lists với cùng `applicableTo`
- Ví dụ:

  ```
  ❌ KHÔNG ĐƯỢC:
  - BG Standard 1: applicableTo = [hcm, hn], validFrom = 2024-03-01, validTo = 2024-03-25
  - BG Standard 2: applicableTo = [hcm], validFrom = 2024-03-05, validTo = 2024-03-26
  → Trùng thời gian cho location "hcm"

  ✅ ĐƯỢC:
  - BG Standard 1: applicableTo = [hcm, hn], validFrom = 2024-03-01, validTo = 2024-03-25
  - BG Standard 2: applicableTo = [hcm], validFrom = 2024-03-26, validTo = 2024-03-31
  → Không trùng thời gian
  ```

---

## 🔄 Flow Nghiệp Vụ Chi Tiết

### **BƯỚC 1: Thiết Lập Bảng Giá (Setup Phase)**

#### 1.1. Tạo Bảng Giá Chính

```
Quản trị viên tạo bảng giá:
├── Tên: "Bảng giá chính 2024"
├── Loại: Standard
├── Trạng thái: Active
├── Currency: VND (mặc định)
├── Thời gian:
│   ├── validFrom: 01/01/2024 (BẮT BUỘC)
│   └── validTo: 31/12/2024 (hoặc NULL = mãi mãi, chỉ cho standard)
└── Điều kiện áp dụng (applicableTo - BẮT BUỘC):
    ├── channels: ["online", "offline"]
    ├── locations: ["hcm", "hn", "dn"]
    ├── regions: ["north", "south", "central"]
    └── customerGroups: ["vip", "regular"]

Lưu ý:
- Hệ thống sẽ validate không trùng valid dates với standard price lists khác có cùng applicableTo
- Phải có ít nhất 1 standard price list active trong hệ thống
```

#### 1.2. Thiết Lập Giá Sản Phẩm (2 cách)

**Cách A: Explicit Pricing (Giá cụ thể từng sản phẩm)**

```
Thêm vào Price List Items:
├── Sản phẩm: Espresso
│   ├── Giá: 25,000 VNĐ
│   └── Số lượng: 1+
├── Sản phẩm: Cappuccino
│   ├── Giá: 35,000 VNĐ
│   └── Số lượng: 1+
└── Sản phẩm: Latte
    ├── Giá: 40,000 VNĐ
    └── Số lượng: 1+
```

**Cách B: Rule-Based Pricing (Quy tắc định giá)**

```
Tạo Pricing Rules:
├── Rule 1: Category "Điện tử" → Giảm 15%
│   └── applyToExceptions: false (chỉ áp dụng cho sản phẩm KHÔNG có explicit price)
├── Rule 2: Brand "Samsung" → Giảm 20%
│   └── applyToExceptions: false
├── Rule 3: Số lượng >= 10 → Giảm 5%
│   └── applyToExceptions: false
└── Rule 4: Khách VIP → Giảm 10%
    └── applyToExceptions: true (áp dụng cho TẤT CẢ sản phẩm, kể cả có explicit price)

Lưu ý:
- Rules mặc định (applyToExceptions = false) chỉ áp dụng cho sản phẩm KHÔNG có explicit price
- Nếu applyToExceptions = true, rule sẽ áp dụng cho TẤT CẢ sản phẩm (kể cả có explicit price)
```

#### 1.3. Tạo Bảng Giá Khuyến Mãi (Nếu cần)

```
Bảng giá: "Khuyến mãi Black Friday"
├── Loại: Promotion
├── Thời gian: 24/11/2024 - 30/11/2024
└── Rules:
    ├── Tất cả sản phẩm → Giảm 20% (cần có giá cơ sở)
    └── Category "Quần áo" → Giảm 30% (cần có giá cơ sở)

Lưu ý: Rules dạng percentage/formula CẦN có giá cơ sở (basePrice > 0)
       Nếu không có giá cơ sở, chỉ rules dạng "fixed" hoặc "tiered" mới hoạt động
```

---

### **BƯỚC 2: Tạo Đơn Hàng (Sales Order)**

#### 2.1. Nhân Viên Tạo Đơn Hàng

```
1. Mở form tạo đơn hàng B2C
2. Nhập thông tin khách hàng:
   ├── Tên: Nguyễn Văn A
   ├── SĐT: 0901234567
   └── Địa chỉ: 123 Đường ABC
3. Chọn Bảng Giá:
   └── Chọn: "Bảng giá chính 2024"
```

#### 2.2. Thêm Sản Phẩm Vào Đơn

**Kịch bản A: Tự động tính giá từ Price List**

```
1. Chọn sản phẩm: "Espresso"
2. Nhập số lượng: 2
3. Hệ thống tự động:
   ├── Tìm trong Price List Items → Tìm thấy: 25,000 VNĐ
   ├── Áp dụng Rules (nếu có)
   └── Hiển thị giá: 25,000 VNĐ
4. Giá được điền tự động vào form
```

**Kịch bản B: Có Rule áp dụng (KHÔNG có explicit price)**

```
1. Chọn sản phẩm: "iPhone 15" (Category: Điện tử)
2. Nhập số lượng: 1
3. Hệ thống tự động:
   ├── Tìm trong Price List Items → KHÔNG tìm thấy
   ├── Dùng giá mặc định từ Product: 25,000,000 VNĐ
   ├── Áp dụng Rule 1: Category "Điện tử" → Giảm 15%
   │   └── Giá sau giảm: 21,250,000 VNĐ
   └── Hiển thị:
       ├── Giá gốc: 25,000,000 VNĐ
       ├── Giảm: 15% (3,750,000 VNĐ)
       └── Giá cuối: 21,250,000 VNĐ
```

**Kịch bản B2: Có Explicit Price → KHÔNG áp dụng Rules**

```
Setup:
├── Product A (Brand B):
│   ├── Variant Va: Giá mặc định 5,000 VNĐ
│   └── Variant Vb: Giá mặc định 4,500 VNĐ
├── Price List:
│   ├── Explicit Price: Va = 4,200 VNĐ
│   └── Rule: Brand B → Giảm 10%

Kết quả:
├── Va: 4,200 VNĐ (dùng explicit price, KHÔNG áp dụng rule)
└── Vb: 4,050 VNĐ (4,500 - 10% = dùng giá mặc định + rule)
```

**Kịch bản C: Không có trong Price List → Tìm trong Bảng Giá Chính**

```
1. Chọn sản phẩm: "Sản phẩm mới" (chưa có trong price list hiện tại)
2. Nhập số lượng: 1
3. Hệ thống tự động:
   ├── Tìm trong Price List hiện tại → Không tìm thấy
   ├── Tìm trong Bảng Giá Chính → Tìm thấy: 30,000 VNĐ
   └── Dùng giá từ Bảng Giá Chính: 30,000 VNĐ
```

**Kịch bản C2: Không có trong cả 2 bảng giá**

```
1. Chọn sản phẩm: "Sản phẩm mới" (chưa có trong cả 2 bảng giá)
2. Nhập số lượng: 1
3. Hệ thống tự động:
   ├── Tìm trong Price List hiện tại → Không tìm thấy
   ├── Tìm trong Bảng Giá Chính → Không tìm thấy
   ├── Tìm Rules → Không có rule phù hợp
   └── Dùng giá mặc định từ Product: 30,000 VNĐ
```

**Kịch bản D: Override thủ công**

```
1. Chọn sản phẩm: "Espresso"
2. Hệ thống tự động điền: 25,000 VNĐ
3. Nhân viên muốn giảm giá đặc biệt:
   ├── Click "Override"
   ├── Nhập giá mới: 20,000 VNĐ
   └── priceSource = "manual_override"
```

#### 2.3. Tính Tổng Đơn Hàng

```
Tổng hợp:
├── Subtotal: Tổng giá các dòng
├── Discount: Giảm giá đơn hàng (nếu có)
├── Tax: Thuế
├── Shipping: Phí vận chuyển
└── Grand Total: Tổng cộng
```

#### 2.4. Lưu Đơn Hàng

```
Hệ thống lưu:
├── Sales Order:
│   ├── priceListId: "uuid-bang-gia-chinh"
│   └── Tổng tiền
└── Order Lines:
    ├── Line 1:
    │   ├── productId: "espresso-uuid"
    │   ├── quantity: 2
    │   ├── unitPrice: 25,000
    │   ├── priceSource: "price_list"
    │   ├── priceListItemId: "uuid-item-espresso"
    │   └── pricingRuleId: null
    └── Line 2:
        ├── productId: "iphone-uuid"
        ├── quantity: 1
        ├── unitPrice: 21,250,000
        ├── priceSource: "price_list"
        ├── priceListItemId: "uuid-item-iphone"
        └── pricingRuleId: "uuid-rule-dien-tu-15%"
```

---

### **BƯỚC 3: Logic Tính Giá Chi Tiết**

#### 3.1. Khi Chọn Sản Phẩm

```
┌─────────────────────────────────────────┐
│ 1. User chọn sản phẩm + số lượng        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. Gọi API: /api/base/price-lists/      │
│    calculate-price                      │
│    - productVariantId                   │
│    - productMasterId                    │
│    - quantity                           │
│    - priceListId (từ SO)               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. PricingService.calculatePrice()      │
│                                         │
│    a) Lấy giá mặc định từ Product      │
│       → defaultSalePrice: 30,000        │
│                                         │
│    b) Tìm trong Price List hiện tại    │
│       ├── Nếu TÌM THẤY explicit price: │
│       │   → Dùng giá đó                │
│       │   → KHÔNG áp dụng rules         │
│       │   → Return ngay                │
│       │                                 │
│       └── Nếu KHÔNG tìm thấy:          │
│           → Tìm trong Bảng Giá Chính   │
│           │   (isDefault = true)        │
│           │                             │
│           ├── Nếu TÌM THẤY trong       │
│           │   Bảng Giá Chính:          │
│           │   → Dùng giá đó            │
│           │   → KHÔNG áp dụng rules     │
│           │   → Return ngay            │
│           │                             │
│           └── Nếu KHÔNG tìm thấy:      │
│               → Dùng giá mặc định      │
│               → Tiếp tục bước c         │
│                                         │
│    c) Tìm Rules phù hợp:                │
│       - Rule 1: Category "Điện tử"      │
│         → Giảm 15%                      │
│       - Rule 2: Quantity >= 10          │
│         → Giảm 5%                       │
│                                         │
│    d) Áp dụng Rules (theo priority):    │
│       - Priority cao nhất: Rule 1       │
│       - Tính: 30,000 * (1 - 15%)        │
│       → finalPrice = 25,500             │
│                                         │
│    e) Return kết quả:                   │
│       {                                 │
│         unitPrice: 25,500,              │
│         basePrice: 30,000,              │
│         discountAmount: 4,500,           │
│         finalPrice: 25,500,             │
│         priceSource: "price_list",      │
│         priceListItemId: undefined,     │
│         pricingRuleId: "uuid-rule-1",  │
│         appliedRules: ["uuid-rule-1"]   │
│       }                                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. UI hiển thị giá                      │
│    - Điền vào form: unitPrice           │
│    - Hiển thị:                          │
│      "Giá: 21,250 VNĐ (từ bảng giá)"   │
│      "Đã áp dụng: Giảm 15% (Category)"  │
└─────────────────────────────────────────┘
```

#### 3.2. Thứ Tự Ưu Tiên Tính Giá

```
Priority 1: Explicit Price trong Price List hiện tại
├── Nếu có → Dùng giá này
│   └── KHÔNG áp dụng rules (explicit price có priority cao nhất)
└── Nếu không → Chuyển sang Priority 2

Priority 2: Explicit Price trong Bảng Giá Chính (Default)
├── Tìm bảng giá chính (isDefault = true)
├── Nếu KHÔNG có bảng giá chính → Bỏ qua, chuyển sang Priority 3
├── Nếu có bảng giá chính:
│   ├── Nếu có explicit price → Dùng giá này
│   │   └── KHÔNG áp dụng rules
│   └── Nếu không có explicit price → Chuyển sang Priority 3
└── Nếu không → Chuyển sang Priority 3

Priority 3: Pricing Rules + Product Default Price
├── Dùng product.defaultSalePrice làm basePrice
├── Tìm tất cả rules phù hợp từ price list hiện tại
├── Sắp xếp theo priority (cao → thấp)
└── Áp dụng rule đầu tiên phù hợp

Priority 4: Product Default Price Only
└── Nếu không có price list item và không có rules phù hợp

Priority 5: Manual Override
└── User có thể override bất cứ lúc nào (override tất cả)
```

**Quy tắc quan trọng:**

- **Explicit Price > Rules**: Nếu có explicit price, KHÔNG áp dụng rules
- **Current Price List > Default Price List**: Tìm trong price list hiện tại trước, sau đó mới tìm trong bảng giá chính
- **Rules chỉ áp dụng**: Khi KHÔNG có explicit price trong cả 2 bảng giá

---

### **BƯỚC 4: Các Trường Hợp Nghiệp Vụ**

#### 4.1. Trường Hợp 1: Tiệm Cà Phê - Giá Cố Định

```
Setup:
├── Bảng giá: "Bảng giá cà phê 2024"
└── Items: Tất cả đồ uống có giá cố định

Tạo đơn:
├── Chọn bảng giá → "Bảng giá cà phê 2024"
├── Chọn "Espresso" → Tự động: 25,000 VNĐ
├── Chọn "Cappuccino" → Tự động: 35,000 VNĐ
└── Không có rules → Giá cố định
```

#### 4.2. Trường Hợp 2: E-commerce - Có Khuyến Mãi

```
Setup:
├── Bảng giá: "Bảng giá chính"
└── Bảng giá: "Khuyến mãi Black Friday"
    └── Rules: Tất cả giảm 20%

Tạo đơn:
├── Chọn bảng giá → "Khuyến mãi Black Friday"
├── Chọn sản phẩm → Giá gốc: 100,000 VNĐ
├── Áp dụng rule → Giảm 20%
└── Giá cuối: 80,000 VNĐ
```

#### 4.3. Trường Hợp 3: Khách VIP - Giá Đặc Biệt

```
Setup:
├── Bảng giá: "Bảng giá VIP"
└── Rules:
    ├── Khách VIP → Giảm 15%
    └── Category "Premium" → Giảm thêm 10%

Tạo đơn:
├── Chọn bảng giá → "Bảng giá VIP"
├── Chọn sản phẩm Premium → Giá gốc: 1,000,000 VNĐ
├── Áp dụng rule VIP → Giảm 15% → 850,000 VNĐ
├── Áp dụng rule Premium → Giảm thêm 10% → 765,000 VNĐ
└── Giá cuối: 765,000 VNĐ
```

#### 4.4. Trường Hợp 4: Thương Lượng Giá

```
Tạo đơn:
├── Chọn sản phẩm → Giá tự động: 100,000 VNĐ
├── Khách hàng yêu cầu giảm giá
├── Nhân viên click "Override"
├── Nhập giá mới: 80,000 VNĐ
└── priceSource = "manual_override"
    └── Lưu audit trail: Giá gốc 100,000 → Override 80,000
```

---

### **BƯỚC 5: Audit Trail & Báo Cáo**

#### 5.1. Audit Trail

```
Mỗi Order Line lưu:
├── priceSource: "price_list" | "manual_override" | "product_default"
├── priceListItemId: ID của price list item đã dùng
├── pricingRuleId: ID của rule đã áp dụng
├── basePrice: Giá gốc trước khi áp dụng rules
└── originalUnitPrice: Giá từ price list (trước override)

→ Biết được giá từ đâu, tại sao có giá đó
```

#### 5.2. Báo Cáo

```
Có thể báo cáo:
├── Số đơn dùng bảng giá nào
├── Số đơn có override thủ công
├── Rules nào được áp dụng nhiều nhất
└── Giá trung bình theo từng bảng giá
```

---

## 📊 Sơ Đồ Flow Tổng Quan

```
┌─────────────────────────────────────────────────────────┐
│                    SETUP PHASE                          │
│  ┌──────────────┐      ┌──────────────┐               │
│  │ Price Lists  │      │ Price Rules  │               │
│  │   (Bảng giá) │      │  (Quy tắc)   │               │
│  └──────┬───────┘      └──────┬───────┘               │
│         │                     │                        │
│         └──────────┬──────────┘                        │
│                    ▼                                    │
│            ┌───────────────┐                           │
│            │ Price List    │                           │
│            │   Items       │                           │
│            └───────────────┘                           │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                  SALES ORDER PHASE                      │
│                                                         │
│  1. Tạo SO → Chọn Price List                           │
│     │                                                   │
│     ▼                                                   │
│  2. Thêm sản phẩm                                       │
│     │                                                   │
│     ▼                                                   │
│  3. Tính giá tự động                                    │
│     ├── Tìm trong Price List Items                     │
│     ├── Áp dụng Rules                                  │
│     └── Fallback: Product default price                │
│     │                                                   │
│     ▼                                                   │
│  4. (Optional) Override thủ công                       │
│     │                                                   │
│     ▼                                                   │
│  5. Lưu SO + Order Lines                               │
│     └── Lưu audit trail                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Tóm Tắt Flow Nghiệp Vụ

1. **Setup**: Tạo bảng giá và rules
2. **Tạo đơn**: Chọn bảng giá cho SO
3. **Chọn sản phẩm**: Hệ thống tự động tính giá
4. **Áp dụng rules**: Nếu có rules phù hợp
5. **Override**: Cho phép override thủ công nếu cần
6. **Lưu**: Lưu SO với đầy đủ thông tin audit trail

---

## 💡 Lợi Ích

✅ **Đơn giản**: 1 SO = 1 Price List (theo chuẩn thực tế)  
✅ **Linh hoạt**: Rules cho bulk pricing, không cần thêm từng sản phẩm  
✅ **Minh bạch**: Audit trail đầy đủ, biết giá từ đâu  
✅ **Thực tế**: Cho phép override khi cần thương lượng
