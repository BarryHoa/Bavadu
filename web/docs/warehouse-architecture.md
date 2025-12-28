# Kiến Trúc Hệ Thống Kho - Tổng Quan

## 1. Tổng Quan Kiến Trúc

### 1.1. Nguyên Tắc Thiết Kế

- **Unified Architecture**: Một kiến trúc kho duy nhất phục vụ cả B2B và B2C
- **Separation of Concerns**: Logic nghiệp vụ theo channel (B2B/B2C) được xử lý ở tầng Service, nhưng Core Inventory Engine dùng chung
- **Shared Core**: Engine quản lý kho chung cho tất cả các loại kho và quy trình
- **Extensibility**: Dễ dàng mở rộng thêm loại kho và quy trình mới

### 1.2. Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (B2B Sales | B2C Sales | Warehouse Management UI)         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   Service Layer (Business Logic)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ B2B Service  │  │ B2C Service  │  │ Other Service│     │
│  │ (Channel)    │  │ (Channel)    │  │              │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│              ┌─────────────▼─────────────┐                  │
│              │  Inventory Manager        │                  │
│              │  (Unified Core Engine)    │                  │
│              └─────────────┬─────────────┘                  │
└────────────────────────────┼────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    Model Layer (Data Access)                 │
│  (Warehouse | Stock Level | Stock Move | Lot)              │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                  Database Layer (PostgreSQL)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Các Loại Kho và Mục Đích Sử Dụng

### 2.1. Bảng Tổng Hợp Các Loại Kho

| Loại Kho          | Mã Loại      | Mục Đích                                                  | Phục Vụ Module    | Attributes                                                        | Mô Tả                                                    |
| ----------------- | ------------ | --------------------------------------------------------- | ----------------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| **Kho Trung Tâm** | `CENTRAL`    | Lưu trữ hàng tồn kho chính, nguồn hàng chính của hệ thống | **Cả B2B & B2C**  | -                                                                 | Kho lớn, tồn kho cao, là nguồn cung cấp cho các kho khác |
| **Kho Sản Xuất**  | `PRODUCTION` | Phục vụ sản xuất (nguyên liệu vào, thành phẩm ra)         | **Manufacturing** | -                                                                 | Kho chuyên dụng cho sản xuất MTO/MTS                     |
| **Kho Bán Lẻ**    | `RETAIL`     | Bán lẻ và fulfillment                                     | **B2C**           | `locationType: "store" \| "fulfillment"`                          | Cửa hàng bán lẻ (POS) hoặc kho fulfillment (online)      |
| **Kho Bán Buôn**  | `WHOLESALE`  | Bán buôn và đại lý                                        | **B2B, B2C**      | `isConsignment: boolean`                                          | Kho bán buôn B2B hoặc gửi đại lý (consignment)           |
| **Kho Đặc Biệt**  | `SPECIAL`    | Kho đặc biệt (bảo hành, mẫu, tạm, transit)                | **Cả B2B & B2C**  | `specialType: "warranty" \| "sample" \| "temporary" \| "transit"` | Kho bảo hành, mẫu, tạm thời, hoặc transit                |

### 2.2. Phân Loại Theo Module

#### Kho Phục Vụ B2B

- **Kho Trung Tâm** (`CENTRAL`): Nguồn hàng chính
- **Kho Bán Buôn** (`WHOLESALE` với `isConsignment: false`): Bán cho khách hàng B2B
- **Kho Sản Xuất** (`PRODUCTION`): Phục vụ MTO/MTS
- **Kho Đặc Biệt** (`SPECIAL` với `specialType: "warranty"`): Xử lý đổi/trả B2B
- **Kho Đặc Biệt** (`SPECIAL` với `specialType: "transit"`): Vận chuyển giữa các kho

#### Kho Phục Vụ B2C

- **Kho Bán Lẻ** (`RETAIL` với `locationType: "fulfillment"`): Xử lý đơn hàng online
- **Kho Bán Lẻ** (`RETAIL` với `locationType: "store"`): Bán tại cửa hàng
- **Kho Bán Buôn** (`WHOLESALE` với `isConsignment: true`): Hàng gửi đại lý/concession
- **Kho Đặc Biệt** (`SPECIAL` với `specialType: "warranty"`): Xử lý đổi/trả B2C
- **Kho Đặc Biệt** (`SPECIAL` với `specialType: "sample"`): Hàng mẫu, demo
- **Kho Đặc Biệt** (`SPECIAL` với `specialType: "temporary"`): Sự kiện, khuyến mãi

#### Kho Dùng Chung

- **Kho Trung Tâm** (`CENTRAL`): Nguồn hàng cho cả B2B và B2C
- **Kho Đặc Biệt** (`SPECIAL`): Xử lý các trường hợp đặc biệt (bảo hành, mẫu, tạm, transit) cho cả B2B và B2C

---

### 2.3. Attributes và Mở Rộng

Để tối ưu hóa và giảm thiểu số loại kho, hệ thống sử dụng **attributes** để phân biệt các trường hợp đặc biệt trong cùng một loại kho. Điều này giúp linh hoạt hơn trong việc quản lý mà không cần tạo thêm nhiều loại kho mới.

#### 2.3.1. RETAIL - locationType

Kho `RETAIL` sử dụng attribute `locationType` để phân biệt:

- **`locationType: "store"`**: Cửa hàng bán lẻ (POS)
  - Bán tại cửa hàng vật lý
  - Tồn kho theo từng cửa hàng
  - Xuất kho real-time khi thanh toán
- **`locationType: "fulfillment"`**: Kho fulfillment (online)
  - Xử lý đơn hàng online (e-commerce)
  - Picking và packing nhiều đơn hàng
  - Zone picking (nếu kho lớn)

**Ví dụ**:

- `RETAIL` với `locationType: "store"` → Cửa hàng ABC (123 Nguyễn Huệ)
- `RETAIL` với `locationType: "fulfillment"` → Kho Fulfillment Hà Nội

#### 2.3.2. WHOLESALE - isConsignment

Kho `WHOLESALE` sử dụng attribute `isConsignment` để phân biệt:

- **`isConsignment: false`**: Kho bán buôn B2B
  - Bán trực tiếp cho khách hàng B2B
  - Thanh toán ngay hoặc theo điều kiện tín dụng
  - Số lượng lớn
- **`isConsignment: true`**: Kho gửi đại lý (Consignment)
  - Gửi hàng cho đại lý/concession để bán
  - Theo dõi công nợ đại lý
  - Hàng không bán được có thể trả về

**Ví dụ**:

- `WHOLESALE` với `isConsignment: false` → Kho Bán Buôn Miền Bắc
- `WHOLESALE` với `isConsignment: true` → Đại Lý ABC Concession

#### 2.3.3. SPECIAL - specialType

Kho `SPECIAL` sử dụng attribute `specialType` để phân biệt:

- **`specialType: "warranty"`**: Kho bảo hành
  - Xử lý hàng đổi/trả
  - Hàng bảo hành, sửa chữa
  - Phục vụ cả B2B và B2C

- **`specialType: "sample"`**: Kho mẫu
  - Lưu hàng mẫu, demo
  - Phục vụ sales/marketing
  - Hàng không bán, chỉ để trưng bày

- **`specialType: "temporary"`**: Kho tạm thời
  - Sự kiện, khuyến mãi
  - Kho ngắn hạn
  - Hàng có thể trả về sau sự kiện

- **`specialType: "transit"`**: Kho điều chuyển
  - Trung chuyển hàng giữa các kho
  - Không lưu hàng lâu dài
  - Tạm thời trong quá trình vận chuyển

**Ví dụ**:

- `SPECIAL` với `specialType: "warranty"` → Kho Bảo Hành Hà Nội
- `SPECIAL` với `specialType: "sample"` → Kho Mẫu Showroom
- `SPECIAL` với `specialType: "temporary"` → Kho Tạm Sự Kiện Triển Lãm 2024
- `SPECIAL` với `specialType: "transit"` → Kho Transit Trung Gian

---

## 3. Quy Trình Nghiệp Vụ Kho

### 3.1. Quy Trình Nhập Kho (Inbound)

#### 3.1.1. Nhập từ Nhà Cung Cấp (Purchase Receipt)

**Mục đích**: Nhận hàng từ nhà cung cấp sau khi mua hàng

**Module quản lý**: Purchase Module (Đơn Mua Hàng)

**Quy trình chuẩn**:

```
1. Module Purchase: Tạo Purchase Order (Đơn Mua Hàng) → Nhà cung cấp
   └─> Xác định: Sản phẩm, số lượng, giá, kho nhận hàng

2. Nhà cung cấp giao hàng → Nhận hàng tại kho
   └─> Kiểm tra: Số lượng, chất lượng, đóng gói

3. Kiểm tra chất lượng (QC - nếu có)
   └─> QC Pass → Tiếp tục
   └─> QC Fail → Từ chối/Trả lại

4. Module Stock: Nhập kho
   └─> Tạo Stock Move (type: INBOUND_PURCHASE)
   └─> Reference: Purchase Order ID
   └─> Warehouse: Kho nhận hàng (có thể là CENTRAL hoặc kho khác)
   └─> Cập nhật Stock Level (+quantity)

5. Module Stock: Tạo Lot (nếu dùng FIFO/LIFO)
   └─> Ghi nhận: Lot number, batch number, unit cost, expiry date

6. Hoàn tất
   └─> Module Purchase: Cập nhật Purchase Order: Received
   └─> Tạo Phiếu Nhập Kho (Goods Receipt Note / GRN)
```

**Kho sử dụng**: `CENTRAL`, `PRODUCTION`, `WHOLESALE`, `RETAIL` (locationType: fulfillment)

**Documents/Phiếu liên quan**:

- Purchase Order (Đơn Mua Hàng) - từ Module Purchase
- Goods Receipt Note / GRN (Phiếu Nhập Kho) - từ Module Stock

---

#### 3.1.2. Nhập từ Sản Xuất (Production Receipt)

**Mục đích**: Nhận thành phẩm sau khi hoàn thành sản xuất

**Module quản lý**: Manufacturing Module (Sản Xuất)

**Quy trình chuẩn**:

```
1. Module Manufacturing: Hoàn thành sản xuất (Production Order - Lệnh Sản Xuất)
   └─> Sản xuất xong: 300 cái bút (MTO)
   └─> Hoặc: Sản xuất tồn kho (MTS)

2. Kiểm tra chất lượng thành phẩm
   └─> QC Pass → Nhập kho

3. Module Stock: Nhập thành phẩm vào kho
   └─> Tạo Stock Move (type: INBOUND_PRODUCTION)
   └─> Reference: Production Order ID
   └─> Source: Production Warehouse
   └─> Target: Target Warehouse (CENTRAL, WHOLESALE, etc.)
   └─> Cập nhật Stock Level (+quantity)

4. Module Stock: Tạo Lot (nếu cần)
   └─> Ghi nhận: Production date, batch number, unit cost

5. Hoàn tất
   └─> Module Manufacturing: Cập nhật Production Order: Completed
   └─> Tạo Phiếu Nhập Kho (Production Receipt Note)
```

**Kho sử dụng**: `PRODUCTION` → `CENTRAL`, `WHOLESALE`, `RETAIL` (locationType: fulfillment)

**Documents/Phiếu liên quan**:

- Production Order (Lệnh Sản Xuất) - từ Module Manufacturing
- Production Receipt Note (Phiếu Nhập Kho Từ Sản Xuất) - từ Module Stock

---

#### 3.1.3. Nhập từ Trả Hàng (Return Receipt)

**Mục đích**: Nhận lại hàng khách hàng trả về

**Module quản lý**: Sales Module (B2B Sales / B2C Sales)

**Quy trình chuẩn**:

```
1. Module Sales: Khách hàng yêu cầu trả hàng
   └─> Tạo Return Request (Yêu Cầu Trả Hàng)
   └─> Lý do: Hàng lỗi, không đúng mô tả, không hài lòng

2. Module Sales: Phê duyệt trả hàng
   └─> Xác nhận: Lý do hợp lệ, hàng có thể nhận lại
   └─> Tạo Sales Return Order (Đơn Trả Hàng)

3. Khách hàng gửi hàng về
   └─> Nhận hàng tại kho

4. Kiểm tra hàng trả về
   └─> Tình trạng: Còn nguyên vẹn, đã sử dụng, hư hỏng
   └─> Quyết định:
       - Nhập lại kho bán (nếu còn tốt)
       - Nhập kho bảo hành (nếu cần sửa chữa)
       - Hủy (nếu không thể bán lại)

5. Module Stock: Nhập kho (nếu có thể nhận lại)
   └─> Tạo Stock Move (type: INBOUND_RETURN)
   └─> Reference: Sales Return Order ID
   └─> Source: Customer
   └─> Target: Warehouse ID (có thể là kho bán hoặc SPECIAL với specialType: warranty)
   └─> Cập nhật Stock Level (+quantity)

6. Module Sales: Xử lý tài chính
   └─> Hoàn tiền cho khách (nếu đã thanh toán)
   └─> Cập nhật công nợ (nếu bán chịu)

7. Hoàn tất
   └─> Module Sales: Cập nhật Sales Order: Returned
   └─> Tạo Phiếu Nhập Kho (Return Receipt Note)
   └─> Gửi xác nhận cho khách
```

**Kho sử dụng**: `SPECIAL` (specialType: warranty), `CENTRAL`, `RETAIL`

**Documents/Phiếu liên quan**:

- Sales Return Order (Đơn Trả Hàng) - từ Module Sales (B2B/B2C)
- Return Receipt Note (Phiếu Nhập Kho Từ Trả Hàng) - từ Module Stock

---

#### 3.1.4. Nhập từ Điều Chuyển (Transfer Receipt)

**Mục đích**: Nhận hàng từ kho khác điều chuyển đến

**Module quản lý**: Stock Module (Kho)

**Quy trình chuẩn**:

```
1. Module Stock: Tạo Transfer Order (Phiếu Điều Chuyển Kho)
   └─> Source: Kho nguồn
   └─> Target: Kho đích (kho này)
   └─> Products & Quantities

2. Module Stock: Kho nguồn xuất hàng
   └─> Tạo Stock Move (OUTBOUND_TRANSFER) tại kho nguồn

3. Vận chuyển hàng
   └─> Vận chuyển từ kho nguồn → kho đích

4. Nhận hàng tại kho đích
   └─> Kiểm tra: Số lượng, tình trạng hàng

5. Module Stock: Nhập kho
   └─> Tạo Stock Move (type: INBOUND_TRANSFER)
   └─> Reference: Transfer Order ID
   └─> Source: Source Warehouse ID
   └─> Target: Target Warehouse ID (kho này)
   └─> Cập nhật Stock Level (+quantity)

6. Hoàn tất
   └─> Module Stock: Cập nhật Transfer Order: Completed
   └─> Tạo Phiếu Nhập Kho (Transfer Receipt Note)
   └─> Xác nhận với kho nguồn
```

**Kho sử dụng**: Tất cả các loại kho (khi nhận điều chuyển)

**Documents/Phiếu liên quan**:

- Transfer Order (Phiếu Điều Chuyển Kho) - từ Module Stock
- Transfer Receipt Note (Phiếu Nhập Kho Từ Điều Chuyển) - từ Module Stock

---

#### 3.1.5. Nhập từ Điều Chỉnh (Adjustment Increase)

**Mục đích**: Điều chỉnh tăng tồn kho (sau kiểm kê, phát hiện thiếu)

**Module quản lý**: Stock Module (Kho)

**Quy trình chuẩn**:

```
1. Module Stock: Kiểm kê hàng tồn kho (Stock Take - Phiếu Kiểm Kê)
   └─> Đếm thực tế: 105 cái
   └─> Tồn hệ thống: 100 cái
   └─> Chênh lệch: +5 cái

2. Xác định nguyên nhân
   └─> Hàng bị sót khi nhập
   └─> Nhầm lẫn trong quy trình
   └─> Hoặc: Lý do khác

3. Module Stock: Phê duyệt điều chỉnh
   └─> Quản lý kho phê duyệt
   └─> Tạo Stock Adjustment Order (Phiếu Điều Chỉnh Kho)

4. Module Stock: Nhập kho (điều chỉnh tăng)
   └─> Tạo Stock Move (type: INBOUND_ADJUSTMENT)
   └─> Reference: Stock Take ID / Stock Adjustment Order ID
   └─> Warehouse: Kho được điều chỉnh
   └─> Quantity: +5 (chênh lệch)
   └─> Cập nhật Stock Level (+quantity)

5. Ghi nhận
   └─> Ghi vào Cost Variance (nếu có)
   └─> Cập nhật báo cáo kiểm kê
```

**Kho sử dụng**: Tất cả các loại kho

**Documents/Phiếu liên quan**:

- Stock Take (Phiếu Kiểm Kê) - từ Module Stock
- Stock Adjustment Order (Phiếu Điều Chỉnh Kho) - từ Module Stock

---

### 3.2. Quy Trình Xuất Kho (Outbound)

#### 3.2.1. Xuất cho Bán B2B (Sales Order Fulfillment)

**Mục đích**: Xuất hàng để bán cho khách hàng B2B

**Module quản lý**: B2B Sales Module (Bán Hàng B2B)

**Quy trình chuẩn**:

```
1. Module B2B Sales: Tạo Sales Order B2B (Đơn Bán Hàng B2B)
   └─> Khách hàng: Công ty ABC
   └─> Sản phẩm: 1000 cái bút
   └─> Kho xuất: WHOLESALE hoặc CENTRAL

2. Module B2B Sales: Xác nhận đơn hàng
   └─> Kiểm tra: Tồn kho, giá, điều kiện thanh toán
   └─> Phê duyệt đơn hàng (nếu cần)

3. Module B2B Sales: Tạo Delivery Order (Phiếu Giao Hàng) / Pick List (Phiếu Lấy Hàng)
   └─> Danh sách sản phẩm cần lấy
   └─> Gán cho nhân viên kho

4. Module Stock: Lấy hàng từ kho (Picking)
   └─> Nhân viên kho lấy hàng theo Pick List (Phiếu Lấy Hàng)
   └─> Scan barcode để xác nhận

5. Module Stock: Xuất kho
   └─> Tạo Stock Move (type: OUTBOUND_SALES_B2B)
   └─> Reference: Sales Order ID / Delivery Order ID
   └─> Source: Warehouse ID (kho xuất)
   └─> Target: Customer (khách hàng B2B)
   └─> Cập nhật Stock Level (-quantity)

6. Module B2B Sales: Đóng gói & Vận chuyển
   └─> Đóng gói hàng
   └─> Tạo vận đơn (Shipping Label)
   └─> Giao cho đơn vị vận chuyển

7. Hoàn tất
   └─> Module B2B Sales: Cập nhật Sales Order: Shipped
   └─> Tạo Phiếu Xuất Kho (Stock Issue Note)
   └─> Gửi tracking number cho khách
   └─> Ghi nhận doanh thu (khi khách nhận hàng)
```

**Kho sử dụng**: `WHOLESALE`, `CENTRAL`

**Documents/Phiếu liên quan**:

- Sales Order B2B (Đơn Bán Hàng B2B) - từ Module B2B Sales
- Delivery Order (Phiếu Giao Hàng) - từ Module B2B Sales
- Pick List (Phiếu Lấy Hàng) - từ Module B2B Sales
- Stock Issue Note (Phiếu Xuất Kho) - từ Module Stock

---

#### 3.2.2. Xuất cho Bán B2C Online (E-commerce Fulfillment)

**Mục đích**: Xuất hàng để bán cho khách hàng B2C qua online

**Module quản lý**: B2C Sales Module (Bán Hàng B2C)

**Quy trình chuẩn**:

```
1. Module B2C Sales: Khách hàng đặt hàng online
   └─> Đặt hàng trên website/app
   └─> Chọn sản phẩm: 5 cái bút
   └─> Thanh toán (hoặc COD)
   └─> Tạo Sales Order B2C (Đơn Bán Hàng B2C)

2. Module B2C Sales: Xác nhận đơn hàng
   └─> Kiểm tra tồn kho RETAIL (locationType: fulfillment)
   └─> Xác nhận đơn hàng
   └─> Xử lý thanh toán

3. Module B2C Sales: Tạo Pick List (Phiếu Lấy Hàng) - có thể batch nhiều đơn
   └─> Nhóm đơn hàng theo khu vực kho
   └─> Zone picking (nếu kho lớn)
   └─> Gán cho nhân viên kho

4. Module Stock: Picking (Lấy hàng)
   └─> Nhân viên kho lấy hàng theo Pick List (Phiếu Lấy Hàng)
   └─> Scan barcode để xác nhận
   └─> Đặt vào container theo đơn hàng

5. Module Stock: Xuất kho
   └─> Tạo Stock Move (type: OUTBOUND_SALES_B2C)
   └─> Reference: Sales Order B2C ID
   └─> Source: RETAIL Warehouse (locationType: fulfillment)
   └─> Target: Customer (khách hàng B2C)
   └─> Cập nhật Stock Level (-quantity)

6. Module B2C Sales: Đóng gói
   └─> Đóng gói từng đơn hàng
   └─> Dán nhãn vận chuyển

7. Module B2C Sales: Giao cho đơn vị vận chuyển
   └─> Tạo vận đơn (Shipping Label)
   └─> Giao cho courier (Grab, Ninja Van, etc.)
   └─> Theo dõi đơn hàng

8. Hoàn tất
   └─> Module B2C Sales: Khách nhận hàng → Cập nhật: Delivered
   └─> Tạo Phiếu Xuất Kho (Stock Issue Note)
   └─> Ghi nhận doanh thu
   └─> Xử lý đổi/trả (nếu có)
```

**Kho sử dụng**: `RETAIL` (locationType: fulfillment), `CENTRAL`

**Documents/Phiếu liên quan**:

- Sales Order B2C (Đơn Bán Hàng B2C) - từ Module B2C Sales
- Pick List (Phiếu Lấy Hàng) - từ Module B2C Sales
- Stock Issue Note (Phiếu Xuất Kho) - từ Module Stock

---

#### 3.2.3. Xuất cho Bán Lẻ Tại Cửa Hàng (Retail Store Sales)

**Mục đích**: Xuất hàng khi khách mua tại cửa hàng (POS)

**Module quản lý**: B2C Sales Module (Bán Hàng B2C) - POS

**Quy trình chuẩn**:

```
1. Module B2C Sales: Khách hàng mua tại cửa hàng
   └─> Khách chọn hàng, mang đến quầy thanh toán

2. Module B2C Sales: Nhân viên bán hàng quét mã/Barcode
   └─> Scan sản phẩm
   └─> Hệ thống kiểm tra tồn kho cửa hàng (real-time)
   └─> Tạo POS Transaction (Giao Dịch POS)

3. Module B2C Sales: Thanh toán
   └─> Khách thanh toán: Tiền mặt, thẻ, e-wallet
   └─> In hóa đơn bán lẻ (Retail Invoice)

4. Module Stock: Xuất kho tự động (Real-time)
   └─> Tạo Stock Move (type: OUTBOUND_RETAIL)
   └─> Reference: POS Transaction ID
   └─> Source: RETAIL Warehouse (locationType: store, cửa hàng này)
   └─> Target: Customer
   └─> Cập nhật Stock Level real-time (-quantity)

5. Giao hàng ngay
   └─> Khách nhận hàng tại chỗ
   └─> Hoàn tất giao dịch

6. Đồng bộ tồn kho
   └─> Tồn kho cửa hàng được cập nhật ngay
   └─> Có thể trigger điều chuyển tự động (nếu tồn thấp)
```

**Kho sử dụng**: `RETAIL` (locationType: store, từng cửa hàng)

**Documents/Phiếu liên quan**:

- POS Transaction (Giao Dịch POS) - từ Module B2C Sales
- Retail Invoice (Hóa Đơn Bán Lẻ) - từ Module B2C Sales

---

#### 3.2.4. Xuất cho Đại Lý (Dealer/Concession Stock)

**Mục đích**: Xuất hàng gửi đại lý/concession (consignment)

**Module quản lý**: B2C Sales Module (Bán Hàng B2C) - Dealer Management

**Quy trình chuẩn**:

```
1. Module B2C Sales: Đại lý đặt hàng
   └─> Đại lý yêu cầu: "Cần 500 cái bút"
   └─> Tạo Dealer Order (Đơn Hàng Đại Lý)

2. Module B2C Sales: Phê duyệt đơn hàng đại lý
   └─> Xác nhận: Hạn mức tín dụng (nếu bán chịu)
   └─> Phê duyệt đơn hàng

3. Module Stock: Xuất kho (gửi bán)
   └─> Tạo Stock Move (type: OUTBOUND_DEALER)
   └─> Reference: Dealer Order ID
   └─> Source: Warehouse ID (CENTRAL, WHOLESALE với isConsignment: true)
   └─> Target: Dealer ID (đại lý)
   └─> Cập nhật Stock Level (-quantity)

4. Module B2C Sales: Ghi nhận công nợ đại lý (nếu bán chịu)
   └─> Tạo Receivable cho đại lý
   └─> Theo dõi công nợ

5. Vận chuyển
   └─> Gửi hàng đến đại lý
   └─> Đại lý nhận hàng

6. Module B2C Sales: Theo dõi bán hàng
   └─> Đại lý bán hàng → Báo cáo định kỳ
   └─> Thanh toán theo thỏa thuận

7. Hàng không bán được
   └─> Đại lý trả lại → Nhập kho (INBOUND_RETURN)
   └─> Hoặc: Ghi nhận tổn thất
```

**Kho sử dụng**: `CENTRAL`, `WHOLESALE` (isConsignment: true)

**Documents/Phiếu liên quan**:

- Dealer Order (Đơn Hàng Đại Lý) - từ Module B2C Sales
- Stock Issue Note (Phiếu Xuất Kho) - từ Module Stock

---

#### 3.2.5. Xuất cho Sản Xuất (Production Issue)

**Mục đích**: Xuất nguyên liệu để sản xuất

**Module quản lý**: Manufacturing Module (Sản Xuất)

**Quy trình chuẩn**:

```
1. Module Manufacturing: Tạo Production Order (Lệnh Sản Xuất)
   └─> Sản xuất: 300 cái bút (MTO)
   └─> Hoặc: Sản xuất tồn kho (MTS)

2. Module Manufacturing: Lập kế hoạch nguyên liệu (Material Planning)
   └─> Xác định: Cần bao nhiêu nguyên liệu
   └─> Kho nguyên liệu: PRODUCTION hoặc CENTRAL
   └─> Tạo Material Issue Order (Phiếu Xuất Nguyên Liệu)

3. Module Stock: Xuất nguyên liệu từ kho
   └─> Tạo Stock Move (type: OUTBOUND_PRODUCTION)
   └─> Reference: Production Order ID / Material Issue Order ID
   └─> Source: Warehouse ID (kho nguyên liệu)
   └─> Target: Production Warehouse
   └─> Cập nhật Stock Level (-quantity)

4. Module Manufacturing: Sử dụng trong sản xuất
   └─> Nguyên liệu được sử dụng
   └─> Sản xuất thành phẩm

5. Nhập thành phẩm (xem 3.1.2)
   └─> Nhập thành phẩm vào kho
   └─> Hoàn tất Production Order
```

**Kho sử dụng**: `PRODUCTION`, `CENTRAL` (nguyên liệu)

**Documents/Phiếu liên quan**:

- Production Order (Lệnh Sản Xuất) - từ Module Manufacturing
- Material Issue Order (Phiếu Xuất Nguyên Liệu) - từ Module Manufacturing
- Stock Issue Note (Phiếu Xuất Kho) - từ Module Stock

---

#### 3.2.6. Xuất cho Sự Kiện/Khuyến Mãi (Event/Promotion)

**Mục đích**: Xuất hàng cho sự kiện, khuyến mãi, marketing

**Module quản lý**: Marketing Module / Sales Module

**Quy trình chuẩn**:

```
1. Module Marketing/Sales: Lập kế hoạch sự kiện
   └─> Sự kiện: "Triển lãm hội chợ"
   └─> Chương trình: "Khuyến mãi cuối năm"
   └─> Xác định: Cần 1000 cái bút
   └─> Tạo Event Order (Đơn Hàng Sự Kiện)

2. Module Marketing/Sales: Tạo Yêu cầu xuất sự kiện
   └─> Loại: Event/Promotion Issue
   └─> Ghi rõ: Mục đích sự kiện, thời gian

3. Module Marketing/Sales: Phê duyệt
   └─> Phê duyệt bởi Marketing/Quản lý
   └─> Xác nhận ngân sách

4. Module Stock: Xuất kho
   └─> Tạo Stock Move (type: OUTBOUND_EVENT)
   └─> Reference: Event Order ID / Event/Promotion ID
   └─> Source: Warehouse ID (CENTRAL, SPECIAL với specialType: temporary)
   └─> Target: Event Location
   └─> Cập nhật Stock Level (-quantity)

5. Module Marketing/Sales: Ghi vào chi phí Marketing
   └─> Ghi nhận chi phí marketing
   └─> Theo dõi ROI

6. Sử dụng tại sự kiện
   └─> Mang hàng đến sự kiện
   └─> Bán/Phát hàng tại sự kiện
   └─> Theo dõi số lượng bán/tiêu thụ

7. Kết thúc sự kiện
   └─> Hàng còn lại: Trả về kho (INBOUND_RETURN)
   └─> Báo cáo kết quả sự kiện
   └─> Đánh giá hiệu quả
```

**Kho sử dụng**: `CENTRAL`, `SPECIAL` (specialType: temporary)

**Documents/Phiếu liên quan**:

- Event Order (Đơn Hàng Sự Kiện) - từ Module Marketing/Sales
- Stock Issue Note (Phiếu Xuất Kho) - từ Module Stock

---

### 3.3. Quy Trình Điều Chuyển Kho (Transfer)

**Mục đích**: Chuyển hàng từ kho này sang kho khác

**Module quản lý**: Stock Module (Kho)

**Quy trình chuẩn**:

```
1. Module Stock: Xác định nhu cầu điều chuyển
   └─> Kho đích: Thiếu hàng, cần bổ sung
   └─> HOẶC: Kho nguồn: Thừa hàng, cần phân phối
   └─> HOẶC: Tái phân phối hàng

2. Module Stock: Tạo Transfer Order (Phiếu Điều Chuyển Kho)
   └─> Source Warehouse: Kho nguồn
   └─> Target Warehouse: Kho đích
   └─> Products & Quantities: Danh sách sản phẩm và số lượng

3. Module Stock: Phê duyệt (nếu cần)
   └─> Quản lý kho phê duyệt điều chuyển
   └─> HOẶC: Tự động phê duyệt (theo quy tắc)

4. Module Stock: Chuẩn bị hàng tại kho nguồn
   └─> Nhân viên kho lấy hàng
   └─> Đóng gói, dán nhãn kho đích

5. Module Stock: Xuất từ kho nguồn
   └─> Tạo Stock Move (type: OUTBOUND_TRANSFER)
   └─> Reference: Transfer Order ID
   └─> Source: Source Warehouse ID
   └─> Target: Target Warehouse ID
   └─> Quantity: -quantity
   └─> Cập nhật Stock Level (giảm kho nguồn)
   └─> Tạo Phiếu Xuất Kho (Stock Issue Note - Transfer)

6. Vận chuyển hàng
   └─> Gửi hàng đến kho đích
   └─> Theo dõi hàng điều chuyển

7. Module Stock: Nhận hàng tại kho đích
   └─> Kho đích nhận hàng
   └─> Kiểm tra: Số lượng, tình trạng hàng

8. Module Stock: Nhập vào kho đích
   └─> Tạo Stock Move (type: INBOUND_TRANSFER)
   └─> Reference: Transfer Order ID
   └─> Source: Source Warehouse ID
   └─> Target: Target Warehouse ID
   └─> Quantity: +quantity
   └─> Cập nhật Stock Level (tăng kho đích)
   └─> Tạo Phiếu Nhập Kho (Transfer Receipt Note)

9. Hoàn tất
   └─> Module Stock: Cập nhật Transfer Order: Completed
   └─> Xác nhận với kho nguồn
   └─> Tổng tồn kho không thay đổi (chỉ chuyển vị trí)
```

**Kho sử dụng**: Tất cả các loại kho

**Documents/Phiếu liên quan**:

- Transfer Order (Phiếu Điều Chuyển Kho) - từ Module Stock
- Stock Issue Note - Transfer (Phiếu Xuất Kho - Điều Chuyển) - từ Module Stock
- Transfer Receipt Note (Phiếu Nhập Kho - Điều Chuyển) - từ Module Stock

**Ví dụ điều chuyển phổ biến**:

- `CENTRAL` → `RETAIL` (locationType: store): Bổ sung hàng cho cửa hàng
- `CENTRAL` → `RETAIL` (locationType: fulfillment): Bổ sung hàng cho kho online
- `CENTRAL` → `WHOLESALE`: Phân phối hàng cho bán B2B
- `RETAIL` (locationType: fulfillment) → `RETAIL` (locationType: store): Điều chuyển hàng giữa kho online và cửa hàng

---

### 3.4. Quy Trình Điều Chỉnh Kho (Adjustment)

**Mục đích**: Điều chỉnh tồn kho khi có chênh lệch (sau kiểm kê, phát hiện sai sót)

**Module quản lý**: Stock Module (Kho)

**Quy trình chuẩn**:

```
1. Module Stock: Kiểm kê hàng tồn kho (Stock Take - Phiếu Kiểm Kê)
   └─> Đếm thực tế: 105 cái
   └─> Tồn hệ thống: 100 cái
   └─> Chênh lệch: +5 cái (HOẶC -5 cái nếu thiếu)

2. Module Stock: So sánh tồn thực tế vs tồn hệ thống
   └─> Xác định: Chênh lệch bao nhiêu
   └─> Nguyên nhân: Sót khi nhập/xuất, nhầm lẫn, mất mát

3. Module Stock: Phê duyệt điều chỉnh
   └─> Quản lý kho phê duyệt
   └─> Xác nhận: Lý do điều chỉnh hợp lệ
   └─> Tạo Stock Adjustment Order (Phiếu Điều Chỉnh Kho)

4. Module Stock: Tạo Adjustment Record
   └─> Ghi nhận: Chênh lệch, lý do, người phê duyệt

5. Module Stock: Điều chỉnh kho
   └─> Nếu tăng: Tạo Stock Move (type: INBOUND_ADJUSTMENT)
   └─> Nếu giảm: Tạo Stock Move (type: OUTBOUND_ADJUSTMENT)
   └─> Reference: Stock Take ID / Stock Adjustment Order ID
   └─> Source/Target: Warehouse ID
   └─> Quantity Delta: (+/-) chênh lệch
   └─> Cập nhật Stock Level

6. Module Stock: Ghi vào Cost Variance (nếu có)
   └─> Nếu giảm: Ghi vào chi phí tổn thất
   └─> Nếu tăng: Ghi vào thu nhập (nếu có)

7. Hoàn tất
   └─> Cập nhật báo cáo kiểm kê
   └─> Lưu trữ hồ sơ điều chỉnh
```

**Kho sử dụng**: Tất cả các loại kho

**Documents/Phiếu liên quan**:

- Stock Take (Phiếu Kiểm Kê) - từ Module Stock
- Stock Adjustment Order (Phiếu Điều Chỉnh Kho) - từ Module Stock

---

### 3.5. Quy Trình Hao Hụt (Loss/Shrinkage)

**Mục đích**: Ghi nhận hàng bị hao hụt, mất mát, hư hỏng

**Module quản lý**: Stock Module (Kho)

**Quy trình chuẩn**:

#### 3.5.1. Hao Hụt Tự Nhiên

```
1. Module Stock: Phát hiện hao hụt
   └─> Kiểm kê: Phát hiện thiếu hàng
   └─> HOẶC: Báo cáo: Hàng hư hỏng, mất mát

2. Module Stock: Phân loại hao hụt
   └─> Hết hạn (Expired)
   └─> Hư hỏng (Damaged)
   └─> Mất mát (Lost/Stolen)
   └─> Hàng lỗi (Defective)

3. Module Stock: Tạo Loss Report (Báo Cáo Hao Hụt)
   └─> Ghi nhận: Số lượng, nguyên nhân, người phát hiện

4. Module Stock: Phê duyệt
   └─> Quản lý kho phê duyệt hủy hàng
   └─> Xác nhận: Nguyên nhân hợp lệ
   └─> Tạo Stock Loss Order (Phiếu Hao Hụt Kho)

5. Module Stock: Ghi nhận hao hụt
   └─> Tạo Stock Move (type: OUTBOUND_LOSS)
   └─> Reference: Loss Report ID / Stock Loss Order ID
   └─> Source: Warehouse ID
   └─> Quantity: -quantity (số lượng hao hụt)
   └─> Cập nhật Stock Level (-quantity)

6. Module Stock: Ghi vào Cost Variance / Loss Account
   └─> Ghi vào chi phí tổn thất
   └─> Theo dõi tỷ lệ hao hụt

7. Xử lý hàng (nếu cần)
   └─> Hủy hàng (Disposal)
   └─> HOẶC: Trả lại nhà cung cấp (nếu hàng lỗi)
```

#### 3.5.2. Hủy Hàng (Disposal)

```
1. Module Stock: Quyết định hủy hàng
   └─> Hàng hết hạn sử dụng
   └─> Hàng hư hỏng không thể sửa
   └─> Hàng lỗi không thể bán

2. Module Stock: Phê duyệt hủy
   └─> Quản lý kho phê duyệt
   └─> Xác nhận: Hàng không thể bán/sử dụng
   └─> Tạo Disposal Order (Phiếu Hủy Hàng)

3. Module Stock: Tạo Disposal Order
   └─> Ghi nhận: Sản phẩm, số lượng, lý do

4. Module Stock: Hủy hàng
   └─> Tạo Stock Move (type: OUTBOUND_LOSS)
   └─> Reference: Disposal Order ID
   └─> Source: Warehouse ID
   └─> Quantity: -quantity
   └─> Cập nhật Stock Level (-quantity)

5. Xử lý vật lý
   └─> Thu gom, tiêu hủy hàng
   └─> HOẶC: Trả lại nhà cung cấp

6. Module Stock: Ghi vào Cost Variance / Loss Account
   └─> Ghi nhận chi phí tổn thất
```

**Kho sử dụng**: Tất cả các loại kho

**Documents/Phiếu liên quan**:

- Loss Report (Báo Cáo Hao Hụt) - từ Module Stock
- Stock Loss Order (Phiếu Hao Hụt Kho) - từ Module Stock
- Disposal Order (Phiếu Hủy Hàng) - từ Module Stock

---

## 4. Tổng Kết Quy Trình

### 4.1. Bảng Tổng Hợp Các Quy Trình

| Quy Trình               | Loại Stock Move       | Mục Đích                  | Module        | Kho Thường Dùng                           |
| ----------------------- | --------------------- | ------------------------- | ------------- | ----------------------------------------- |
| **Nhập từ mua hàng**    | `INBOUND_PURCHASE`    | Nhận hàng từ nhà cung cấp | B2B, B2C      | CENTRAL, PRODUCTION                       |
| **Nhập từ sản xuất**    | `INBOUND_PRODUCTION`  | Nhận thành phẩm           | Manufacturing | PRODUCTION → CENTRAL                      |
| **Nhập từ trả hàng**    | `INBOUND_RETURN`      | Nhận hàng khách trả       | B2B, B2C      | SPECIAL (specialType: warranty), CENTRAL  |
| **Nhập từ điều chuyển** | `INBOUND_TRANSFER`    | Nhận hàng từ kho khác     | B2B, B2C      | Tất cả                                    |
| **Nhập từ điều chỉnh**  | `INBOUND_ADJUSTMENT`  | Điều chỉnh tăng           | B2B, B2C      | Tất cả                                    |
| **Xuất bán B2B**        | `OUTBOUND_SALES_B2B`  | Bán cho khách B2B         | **B2B**       | WHOLESALE, CENTRAL                        |
| **Xuất bán B2C**        | `OUTBOUND_SALES_B2C`  | Bán online                | **B2C**       | RETAIL (locationType: fulfillment)        |
| **Xuất bán lẻ**         | `OUTBOUND_RETAIL`     | Bán tại cửa hàng          | **B2C**       | RETAIL (locationType: store)              |
| **Xuất đại lý**         | `OUTBOUND_DEALER`     | Gửi đại lý                | **B2C**       | WHOLESALE (isConsignment: true)           |
| **Xuất sản xuất**       | `OUTBOUND_PRODUCTION` | Xuất nguyên liệu          | Manufacturing | PRODUCTION                                |
| **Xuất sự kiện**        | `OUTBOUND_EVENT`      | Marketing/Events          | Marketing     | CENTRAL, SPECIAL (specialType: temporary) |
| **Xuất điều chuyển**    | `OUTBOUND_TRANSFER`   | Điều chuyển kho           | B2B, B2C      | Tất cả                                    |
| **Xuất điều chỉnh**     | `OUTBOUND_ADJUSTMENT` | Điều chỉnh giảm           | B2B, B2C      | Tất cả                                    |
| **Xuất hao hụt**        | `OUTBOUND_LOSS`       | Hao hụt, mất mát          | B2B, B2C      | Tất cả                                    |
| **Điều chuyển kho**     | `TRANSFER_WAREHOUSE`  | Chuyển kho này → kho kia  | B2B, B2C      | Tất cả                                    |

### 4.2. Quy Trình Chuẩn Tổng Quát

#### 4.2.1. Quy Trình Nhập Kho Chuẩn

```
1. Nhận hàng (từ nguồn nào đó)
2. Kiểm tra (số lượng, chất lượng)
3. Tạo Stock Move (type: INBOUND_*)
4. Cập nhật Stock Level (+quantity)
5. Tạo Lot (nếu cần FIFO/LIFO)
6. Hoàn tất (cập nhật document liên quan)
```

#### 4.2.2. Quy Trình Xuất Kho Chuẩn

```
1. Tạo yêu cầu xuất (order, request)
2. Phê duyệt (nếu cần)
3. Tạo Pick List / Delivery Order
4. Lấy hàng (Picking)
5. Tạo Stock Move (type: OUTBOUND_*)
6. Cập nhật Stock Level (-quantity)
7. Đóng gói & Vận chuyển
8. Hoàn tất (cập nhật document)
```

#### 4.2.3. Quy Trình Điều Chuyển Kho Chuẩn

```
1. Tạo Transfer Order
2. Phê duyệt (nếu cần)
3. Xuất từ kho nguồn (OUTBOUND_TRANSFER)
4. Vận chuyển
5. Nhập vào kho đích (INBOUND_TRANSFER)
6. Hoàn tất
```

#### 4.2.4. Quy Trình Điều Chỉnh/Hao Hụt Chuẩn

```
1. Phát hiện chênh lệch (kiểm kê, báo cáo)
2. Phân loại nguyên nhân
3. Phê duyệt
4. Tạo Stock Move (type: ADJUSTMENT / LOSS)
5. Cập nhật Stock Level
6. Ghi vào Cost Variance (nếu có)
7. Hoàn tất
```

---

## 5. Kiến Trúc Đề Xuất

### 5.1. Unified Architecture

**Nguyên tắc**: Một kiến trúc kho duy nhất, không tách riêng cho B2B và B2C

**Lý do**:

- ✅ Tránh code trùng lặp
- ✅ Dễ bảo trì và phát triển
- ✅ Đảm bảo tính nhất quán dữ liệu
- ✅ Giảm độ phức tạp

**Cách tiếp cận**:

```
┌─────────────────────────────────────────────────────────┐
│              Unified Inventory Manager                   │
│  (Shared Core - Xử lý tất cả logic kho chung)          │
│                                                          │
│  - checkAvailability()                                  │
│  - reserveStock()                                        │
│  - issueStock()                                          │
│  - receiveStock()                                        │
│  - transferStock()                                       │
│  - adjustStock()                                         │
│  - getStockLevel()                                       │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
│ B2B Service  │ │ B2C Service │ │Other Service│
│              │ │             │ │            │
│ - createOrder│ │ - createOrder│ │            │
│ - fulfillOrder│ │ - fulfillOrder│ │            │
│ - handleB2B │ │ - handleB2C │ │            │
│  specific    │ │  specific   │ │            │
│  logic       │ │  logic      │ │            │
└──────────────┘ └─────────────┘ └────────────┘
```

### 5.2. Separation of Concerns

- **Inventory Manager** (Core Engine): Xử lý tất cả nghiệp vụ kho chung (shared)
- **B2B Service**: Logic nghiệp vụ riêng của B2B (order type, pricing, approval workflow)
- **B2C Service**: Logic nghiệp vụ riêng của B2C (real-time, small quantity, returns)

---

## 6. Best Practices

### 6.1. Nguyên Tắc Quản Lý Kho

1. **Luôn cập nhật Stock Level thông qua Stock Move**
   - Không update trực tiếp Stock Level
   - Mọi thay đổi tồn kho phải có Stock Move record

2. **Ghi nhận đầy đủ thông tin**
   - Reference: ID của document liên quan (order, transfer, etc.)
   - Document Type: Loại document (sales_order, purchase_order, etc.)
   - User ID: Người thực hiện
   - Note: Ghi chú, lý do

3. **Validation trước khi thực hiện**
   - Kiểm tra tồn kho có đủ không (với outbound)
   - Validate warehouse type phù hợp
   - Validate số lượng (> 0)

4. **Transaction Safety**
   - Dùng transaction cho các operations có nhiều bước
   - Đảm bảo atomicity (all or nothing)

5. **Audit Trail**
   - Ghi lại mọi thay đổi
   - Có thể trace back từng Stock Move
   - Theo dõi lịch sử thay đổi

### 6.2. Quản Lý Tồn Kho

1. **Real-time Stock Level**
   - Cập nhật tồn kho ngay sau mỗi Stock Move
   - Đồng bộ giữa các kho (nếu có)

2. **Reserved Quantity**
   - Dự trữ hàng cho đơn hàng đã xác nhận
   - Available = Total - Reserved
   - Release reservation khi xuất kho hoặc hủy đơn

3. **Multi-warehouse**
   - Theo dõi tồn kho theo từng kho
   - Tổng tồn = Sum(tồn các kho)
   - Có thể điều chuyển giữa các kho

4. **Lot Tracking (FIFO/LIFO)**
   - Theo dõi từng lô hàng (nếu cần)
   - Xác định giá vốn theo phương pháp FIFO/LIFO/AVG

### 6.3. Xử Lý Đặc Biệt

1. **Bán Lẻ (Retail)**
   - Xuất kho real-time khi thanh toán
   - Tồn kho theo từng cửa hàng
   - Đồng bộ tồn kho giữa các cửa hàng

2. **E-commerce (B2C Online)**
   - Picking nhiều đơn hàng cùng lúc (batch)
   - Zone picking (nếu kho lớn)
   - Xử lý đổi/trả thường xuyên

3. **Bán Buôn (B2B)**
   - Số lượng lớn
   - Có thể có approval workflow
   - Bán chịu (credit terms)

4. **Điều Chuyển**
   - Tổng tồn không thay đổi (chỉ chuyển vị trí)
   - Cần vận chuyển vật lý
   - Có thể có delay giữa xuất và nhập

---

## Kết Luận

Tài liệu này mô tả tổng quan về kiến trúc hệ thống kho, bao gồm:

1. ✅ **Các loại kho và mục đích sử dụng**: 10 loại kho phục vụ B2B, B2C, hoặc cả hai
2. ✅ **Quy trình nghiệp vụ đầy đủ**: Nhập, xuất, điều chuyển, điều chỉnh, hao hụt
3. ✅ **Quy trình chuẩn**: Mô tả chi tiết từng bước cho mỗi quy trình
4. ✅ **Kiến trúc unified**: Một kiến trúc kho duy nhất, không tách B2B/B2C
5. ✅ **Best practices**: Nguyên tắc quản lý kho, xử lý đặc biệt

Kiến trúc này đảm bảo:

- **Tính nhất quán**: Tất cả các module dùng chung core engine
- **Dễ bảo trì**: Code tập trung, logic rõ ràng
- **Dễ mở rộng**: Có thể thêm loại kho và quy trình mới
- **Hiệu quả**: Tận dụng tối đa code và tài nguyên
