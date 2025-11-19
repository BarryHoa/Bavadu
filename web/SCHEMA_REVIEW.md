# Schema Review - Product & Stock Management

Tài liệu này tổng hợp tất cả các schema đã được tạo theo thảo luận.

## 📋 Tổng quan

### 1. Product Type Specific Tables
Mỗi loại sản phẩm có bảng riêng để lưu thông tin đặc thù, tất cả link với `productVariantId`:

- `product_type_goods` - Hàng hóa mua bán
- `product_type_raw_material` - Nguyên vật liệu
- `product_type_finished_good` - Thành phẩm
- `product_type_consumable` - Vật tư tiêu hao
- `product_type_tool` - Công cụ/Thiết bị
- `product_type_asset` - Tài sản cố định
- `product_type_service` - Dịch vụ

### 2. Stock Management Tables
- `stock_settings` - Cấu hình tồn kho theo từng kho (minStockLevel, reorderPoint)
- `stock_lot` - Quản lý từng lô hàng nhập (cho FIFO/LIFO)
- `stock_lot_move` - Theo dõi xuất từ lot nào
- `cost_variance` - Theo dõi chênh lệch giá (cho Standard Cost)

### 3. Updated Tables
- `product_variant` - Thêm `costMethod` và `standardCost`
- `stock_level` - Thêm `averageCost` và `totalCostValue`

---

## 📊 Chi tiết các bảng

### Product Type: Goods
**File:** `modules/product/server/schemas/product-type-goods.ts`

**Fields:**
- `productVariantId` (unique) - Link với variant
- `defaultSalePrice` - Giá bán mặc định
- `defaultPurchasePrice` - Giá mua mặc định
- `weight`, `dimensions`, `color`, `style` - Thuộc tính vật lý
- `expiryDate`, `expiryTracking`, `storageConditions` - Hạn sử dụng

**Use case:** Bánh kẹo, giỏ xách, lẵng hoa - hàng mua bán

---

### Product Type: Raw Material
**File:** `modules/product/server/schemas/product-type-raw-material.ts`

**Fields:**
- `productVariantId` (unique)
- `defaultPurchasePrice`
- `specifications` (JSONB) - Thông số kỹ thuật
- `qualityStandard`
- `primarySupplierId` - Nhà cung cấp chính
- `leadTimeDays` - Thời gian giao hàng
- `safetyStock`, `defaultReorderPoint` - Quản lý tồn kho

**Use case:** Nguyên vật liệu sản xuất

---

### Product Type: Finished Good
**File:** `modules/product/server/schemas/product-type-finished-good.ts`

**Fields:**
- `productVariantId` (unique)
- `defaultSalePrice`
- `defaultManufacturingCost`
- `billOfMaterialsId` - Link đến BOM
- `productionTime`, `productionUnit`
- `qualityStandard`

**Use case:** Thành phẩm sản xuất

---

### Product Type: Consumable
**File:** `modules/product/server/schemas/product-type-consumable.ts`

**Fields:**
- `productVariantId` (unique)
- `defaultPurchasePrice`
- `defaultMinStockLevel`, `defaultReorderPoint`
- `expiryTracking`, `storageConditions`
- `packagingUnit`

**Use case:** Băng keo, viết, giấy in - vật tư tiêu hao

---

### Product Type: Tool
**File:** `modules/product/server/schemas/product-type-tool.ts`

**Fields:**
- `productVariantId` (unique)
- `serialNumber` (unique) - Số serial
- `modelNumber`
- `purchaseDate`, `purchasePrice`
- `warrantyPeriodMonths`
- `maintenanceIntervalDays`
- `lastMaintenanceDate`, `nextMaintenanceDate`
- `status` - in-use, maintenance, retired
- `location`, `assignedToUserId`

**Use case:** Máy in, máy post - công cụ/thiết bị

---

### Product Type: Asset
**File:** `modules/product/server/schemas/product-type-asset.ts`

**Fields:**
- `productVariantId` (unique)
- `assetCode` (unique) - Mã tài sản
- `purchaseDate`, `purchasePrice`
- `depreciationMethod` - straight-line, declining-balance
- `usefulLifeYears` - Thời gian sử dụng
- `residualValue` - Giá trị còn lại
- `depreciationRate` - Tỷ lệ khấu hao
- `depreciationStartDate`
- `currentValue` - Giá trị hiện tại
- `location`, `assignedToUserId`

**Use case:** Tài sản cố định

---

### Product Type: Service
**File:** `modules/product/server/schemas/product-type-service.ts`

**Fields:**
- `productVariantId` (unique)
- `defaultServicePrice`
- `unit` - hour, day, month, project
- `duration`
- `detailedDescription`, `specialRequirements`

**Use case:** Dịch vụ

---

## 💰 Cost Calculation

### Product Variant - Cost Method
**File:** `modules/product/server/schemas/product-variant.ts`

**New Fields:**
- `costMethod` (varchar, default: "average") - "average" | "fifo" | "lifo" | "standard"
- `standardCost` (numeric) - Chỉ dùng khi costMethod = "standard"

**Cách hoạt động:**
- Mỗi variant chọn 1 phương pháp tính giá vốn
- Hệ thống tự động tính theo method đã chọn

---

### Stock Level - Average Cost
**File:** `modules/stock/server/schemas/level.ts`

**New Fields:**
- `averageCost` (numeric, default: 0) - Giá vốn trung bình
- `totalCostValue` (numeric, default: 0) - Tổng giá trị tồn kho

**Cách hoạt động:**
- Dùng cho phương pháp "average"
- Tự động cập nhật khi nhập/xuất kho

---

### Stock Lot - FIFO/LIFO
**File:** `modules/stock/server/schemas/stock-lot.ts`

**Fields:**
- `productVariantId`, `warehouseId`
- `lotNumber`, `batchNumber`
- `purchaseOrderLineId` - Link đến đơn mua
- `purchaseDate` - Ngày mua (để sắp xếp FIFO/LIFO)
- `unitCost` - Giá vốn của lô này
- `quantityReceived`, `quantityAvailable`, `quantityReserved`
- `expiryDate`, `manufactureDate`
- `status` - active, expired, depleted

**Cách hoạt động:**
- Mỗi lần nhập tạo 1 lot mới
- Khi xuất, query lots và xuất theo FIFO (cũ nhất) hoặc LIFO (mới nhất)

---

### Stock Lot Move
**File:** `modules/stock/server/schemas/stock-lot-move.ts`

**Fields:**
- `stockMoveId` - Link đến stock_move
- `stockLotId` - Link đến lot
- `quantity` - Số lượng xuất
- `unitCost` - Giá vốn tại thời điểm xuất
- `totalCost` - quantity * unitCost
- `moveType` - inbound, outbound, transfer

**Cách hoạt động:**
- Ghi lại từng lần xuất từ lot nào
- Dùng để tính giá vốn và truy xuất nguồn gốc

---

### Cost Variance - Standard Cost
**File:** `modules/stock/server/schemas/cost-variance.ts`

**Fields:**
- `productVariantId`
- `purchaseOrderLineId`
- `standardCost` - Giá vốn tiêu chuẩn
- `actualCost` - Giá mua thực tế
- `variance` - Chênh lệch (actualCost - standardCost)
- `quantity` - Số lượng
- `totalVariance` - variance * quantity

**Cách hoạt động:**
- Dùng cho phương pháp "standard"
- Theo dõi chênh lệch giữa giá thực tế và giá tiêu chuẩn

---

## 🏪 Stock Settings

**File:** `modules/stock/server/schemas/stock-settings.ts`

**Fields:**
- `productId`, `warehouseId` (unique together)
- `minStockLevel` - Mức tồn kho tối thiểu
- `reorderPoint` - Điểm đặt hàng lại
- `maxStockLevel` - Mức tồn kho tối đa
- `leadTime` - Thời gian giao hàng (days)

**Cách hoạt động:**
- Cấu hình riêng cho từng sản phẩm ở từng kho
- Có thể override giá trị mặc định từ product_type_xxx

---

## 🔗 Relationships

```
product_master (1) ──< (N) product_variant (1) ──< (1) product_type_xxx
                                                      │
                                                      ├─> (N) stock_lot (cho FIFO/LIFO)
                                                      │
                                                      └─> (N) cost_variance (cho standard)

product_master (1) ──< (N) stock_level (N) ──< (1) stock_warehouse
                                 │
                                 └─> (N) stock_settings

stock_move (1) ──< (N) stock_lot_move (N) ──< (1) stock_lot
```

---

## 📝 Notes

1. **Tất cả product_type_xxx đều có unique constraint trên productVariantId** - Mỗi variant chỉ có 1 record trong bảng type tương ứng

2. **Cost Method được chọn ở product_variant** - Mỗi variant có thể chọn phương pháp tính giá vốn riêng

3. **Stock Settings theo warehouse** - Cùng 1 sản phẩm có thể có cấu hình khác nhau ở các kho

4. **Stock Lots chỉ tạo khi dùng FIFO/LIFO** - Nếu dùng average hoặc standard thì không cần tạo lots

5. **Average Cost luôn được cập nhật** - Dù dùng method nào, averageCost trong stock_level vẫn được cập nhật để tham khảo

---

## ✅ Checklist Review

- [ ] Kiểm tra tất cả foreign keys
- [ ] Kiểm tra indexes phù hợp
- [ ] Kiểm tra unique constraints
- [ ] Kiểm tra default values
- [ ] Kiểm tra nullable fields
- [ ] Kiểm tra data types (numeric precision)
- [ ] Kiểm tra cascade delete behavior

---

## 🚀 Next Steps

Sau khi review xong, cần:
1. Tạo migration files
2. Tạo models/interfaces cho các bảng mới
3. Implement Cost Calculator Service (Strategy Pattern)
4. Update StockModel để tích hợp cost calculation
5. Tạo API endpoints cho các bảng mới

