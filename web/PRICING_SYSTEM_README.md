# Hệ thống Bảng giá B2C

## Tổng quan

Hệ thống bảng giá B2C được thiết kế theo mô hình: **1 SO = 1 Price List + Rules/Promotions + Manual Override**

## Cấu trúc Database

### 1. Price Lists (`price_lists_b2c`)
Bảng giá chính, mỗi Sales Order sẽ reference đến 1 price list.

### 2. Price List Items (`price_list_items_b2c`)
Chi tiết giá cho từng sản phẩm trong price list (explicit pricing).

### 3. Pricing Rules (`pricing_rules_b2c`)
Quy tắc định giá theo điều kiện (category, brand, quantity, etc.) - dùng cho bulk pricing.

### 4. Price Tiers (`price_tiers_b2c`)
Giá theo bậc số lượng (tiered pricing).

## Migration

Chạy migration để tạo các bảng:

```bash
# Migration file: server/db/migrations/0009_price_lists_b2c.sql
```

## API Endpoints

### Calculate Price
```
POST /api/base/price-lists/calculate-price

Body:
{
  "productVariantId": "uuid",
  "productMasterId": "uuid",
  "quantity": 10,
  "priceListId": "uuid",
  "customerGroupId": "uuid", // optional
  "channel": "online", // optional
  "region": "uuid" // optional
}

Response:
{
  "data": {
    "unitPrice": 25000,
    "basePrice": 30000,
    "discountAmount": 5000,
    "finalPrice": 25000,
    "priceSource": "price_list",
    "priceListItemId": "uuid",
    "pricingRuleId": "uuid",
    "appliedRules": ["uuid1", "uuid2"]
  }
}
```

## Logic tính giá

1. **Tìm explicit price** trong `price_list_items_b2c`
2. **Áp dụng pricing rules** (theo priority)
3. **Fallback** về `product.defaultSalePrice`
4. **Cho phép manual override** trong order line

## Sử dụng trong Sales Order

### 1. Thêm priceListId vào SO
```typescript
// Trong form tạo SO
const order = {
  priceListId: "uuid-of-price-list",
  // ... other fields
};
```

### 2. Tự động tính giá khi chọn sản phẩm
```typescript
// Khi chọn sản phẩm trong order line
const response = await fetch("/api/base/price-lists/calculate-price", {
  method: "POST",
  body: JSON.stringify({
    productVariantId: product.id,
    productMasterId: product.masterId,
    quantity: 1,
    priceListId: order.priceListId,
  }),
});

const { data } = await response.json();
// Set giá vào form
setValue(`lines.${index}.unitPrice`, data.finalPrice.toString());
```

### 3. Manual Override
```typescript
// Cho phép override thủ công
setValue(`lines.${index}.priceSource`, "manual_override");
setValue(`lines.${index}.unitPrice`, "20000"); // Giá mới
```

## Ví dụ Pricing Rules

### Rule 1: Giảm giá theo category
```json
{
  "conditions": {
    "categories": ["category-uuid-1"]
  },
  "pricingMethod": "percentage",
  "discountType": "percentage",
  "discountValue": 15,
  "priority": 10
}
```

### Rule 2: Giảm giá theo số lượng
```json
{
  "conditions": {},
  "pricingMethod": "tiered",
  "minQuantity": 10,
  "maxQuantity": null,
  "priority": 5
}
```

### Rule 3: Giảm giá theo brand
```json
{
  "conditions": {
    "brands": ["Samsung", "Apple"]
  },
  "pricingMethod": "percentage",
  "discountType": "percentage",
  "discountValue": 20,
  "priority": 8
}
```

## Lưu ý

1. **Priority**: Rules có priority cao hơn sẽ được áp dụng trước
2. **Conditions**: Các điều kiện trong rules phải match thì rule mới được áp dụng
3. **Manual Override**: Khi override thủ công, `priceSource` sẽ là `"manual_override"`
4. **Audit Trail**: Mỗi order line lưu `priceListItemId`, `pricingRuleId` để biết giá từ đâu

## Next Steps

1. Tạo UI để quản lý Price Lists
2. Tạo UI để quản lý Pricing Rules
3. Tích hợp vào form tạo Sales Order
4. Thêm validation và error handling

