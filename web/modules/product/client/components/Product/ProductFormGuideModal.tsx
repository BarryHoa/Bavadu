"use client";

import { MarkdownContent } from "@base/client/components";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { HelpCircle } from "lucide-react";

interface ProductFormGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Markdown content
const guideContent = `

## 1. Master là gì?

**Master (Product Master)** là template hoặc bản mẫu của sản phẩm, định nghĩa các thông tin chung và cấu hình cơ bản của sản phẩm.

### Đặc điểm của Master:
- **Mã sản phẩm (Code)**: Mã duy nhất để nhận diện sản phẩm
- **Tên sản phẩm (Name)**: Tên sản phẩm hỗ trợ đa ngôn ngữ (Tiếng Việt, Tiếng Anh)
- **Loại sản phẩm (Product Type)**: Phân loại sản phẩm (Hàng hóa, Dịch vụ, Thành phẩm, Nguyên liệu, Vật tư tiêu hao, Tài sản, Công cụ)
- **Tính năng (Features)**: Các module mà sản phẩm có thể sử dụng (Bán, Mua, Sản xuất, Gia công ngoài, Lưu kho, Bảo trì, Tài sản, Kế toán)
- **Danh mục (Category)**: Phân loại theo danh mục sản phẩm
- **Thương hiệu (Brand)**: Thương hiệu của sản phẩm

Master đóng vai trò là "bản thiết kế" chung, từ đó có thể tạo ra nhiều **Variant** (biến thể) khác nhau.

---

## 2. Variant là gì?

**Variant (Product Variant)** là các biến thể cụ thể của một Master, đại diện cho các phiên bản khác nhau của cùng một sản phẩm.

### Ví dụ:
- Master: "Áo thun nam"
  - Variant 1: Áo thun nam - Size M - Màu đỏ
  - Variant 2: Áo thun nam - Size L - Màu xanh
  - Variant 3: Áo thun nam - Size XL - Màu đen

### Thông tin của Variant:
- **SKU**: Mã SKU riêng cho từng variant
- **Barcode**: Mã vạch riêng
- **Tên variant**: Tên cụ thể của variant (hỗ trợ đa ngôn ngữ)
- **Đơn vị tính (Base UOM)**: 
  - Đơn vị lưu kho chính của sản phẩm
  - Là đơn vị nhỏ nhất, dùng làm chuẩn để quy đổi sang các đơn vị khác
  - Khi quy đổi từ Base UOM sang các đơn vị lớn hơn (ví dụ: cái → thùng, thùng → pallet), hệ thống sẽ tính toán chính xác không bị lệch số
  - **Lưu ý quan trọng**: Base UOM không thể thay đổi sau khi đã tạo variant, vì nó ảnh hưởng đến toàn bộ dữ liệu kho và quy đổi đã được lưu trữ
- **Thông tin nhà sản xuất**: Tên và mã nhà sản xuất
- **Thuộc tính (Attributes)**: Các thuộc tính riêng của variant (màu sắc, kích thước, v.v.)
- **Đóng gói (Packings)**: Các cách đóng gói khác nhau (sử dụng Base UOM làm đơn vị cơ sở để tính toán)

### Quy định về Variant:

#### Tối thiểu:
- **Mỗi Master phải có ít nhất 1 Variant**
- Không thể tạo Master mà không có Variant

#### Tối đa:
- **Mỗi Master có tối đa 20 Variants**
- Hệ thống sẽ tự động vô hiệu hóa nút "Add Variant" khi đạt giới hạn

### Mối quan hệ Master - Variant:
- **1 Master** → **Nhiều Variants** (1:N)
- Master chứa thông tin chung, Variant chứa thông tin cụ thể
- Khi xóa Master, tất cả Variants sẽ bị xóa theo
- Không thể xóa hết Variants (phải giữ lại ít nhất 1)

---

## 3. Product Type (Loại sản phẩm)

Product Type định nghĩa bản chất và mục đích sử dụng của sản phẩm trong hệ thống.

### Các loại Product Type:

1. **Goods (Hàng hóa)**
   - Hàng hóa thông thường, mua bán trực tiếp
   - Module: Sales, Purchase, Inventory

2. **Service (Dịch vụ)**
   - Sản phẩm dịch vụ, không tồn kho
   - Module: Sales, Purchase

3. **Finished Good (Thành phẩm)**
   - Sản phẩm hoàn chỉnh được sản xuất ra
   - Module: MRP, Sales, Inventory
   - Là output của quá trình sản xuất

4. **Raw Material (Nguyên liệu)**
   - Nguyên vật liệu đầu vào cho sản xuất
   - Module: MRP, Purchase, Inventory
   - Là input của BOM (Bill of Materials)

5. **Consumable (Vật tư tiêu hao)**
   - Vật tư dùng một lần, tiêu hao trong quá trình sản xuất
   - Module: Purchase, Inventory

6. **Asset (Tài sản)**
   - Tài sản cố định, có thể khấu hao
   - Module: Asset, Accounting

7. **Tool (Công cụ)**
   - Công cụ, thiết bị dùng nhiều lần, cần bảo trì
   - Module: Maintenance, Purchase

---

## 4. Product Features (Tính năng sản phẩm)

Product Features là các "cổng" (gates) cho phép sản phẩm sử dụng các module khác nhau trong hệ thống.

### Các Features:

1. **Sale (Bán)**: Cho phép bán sản phẩm này
2. **Purchase (Mua)**: Cho phép mua sản phẩm này
3. **Manufacture (Sản xuất)**: Cho phép sản xuất sản phẩm này
4. **Subcontract (Gia công ngoài)**: Cho phép gia công ngoài
5. **Stockable (Lưu kho)**: Cho phép lưu trữ trong kho
6. **Maintenance (Bảo trì)**: Cho phép bảo trì sản phẩm
7. **Asset (Tài sản)**: Sản phẩm có thể được quản lý như tài sản
8. **Accounting (Kế toán)**: Có thể khấu hao lâu dài

### Lưu ý:
- Features là các checkbox, có thể bật/tắt nhiều tính năng cùng lúc
- Mặc định, tính năng "Sale" được bật khi tạo mới

---

## 5. Ràng buộc giữa Product Type và Features

Hệ thống có các ràng buộc logic giữa Product Type và Features để đảm bảo tính nhất quán:

### Bảng ràng buộc:

| Product Type | Features bắt buộc | Features không được phép | Features tùy chọn |
|--------------|-------------------|--------------------------|-------------------|
| **Goods** | Sale, Purchase, Stockable | Manufacture, Subcontract | Maintenance, Asset, Accounting |
| **Service** | Sale, Purchase | Stockable, Manufacture, Subcontract | Maintenance, Asset, Accounting |
| **Finished Good** | Manufacture, Stockable | - | Sale, Purchase, Subcontract, Maintenance, Asset, Accounting |
| **Raw Material** | Purchase, Stockable, Manufacture (input) | - | Sale, Subcontract, Maintenance, Asset, Accounting |
| **Consumable** | Purchase, Stockable | Manufacture, Subcontract | Sale, Maintenance, Asset, Accounting |
| **Asset** | Purchase, Asset, Accounting | Manufacture, Subcontract | Sale, Stockable, Maintenance |
| **Tool** | Purchase, Maintenance | Manufacture, Subcontract | Sale, Stockable, Asset, Accounting |

### Quy tắc chung:

1. **Service** không thể có **Stockable** (dịch vụ không tồn kho)
2. **Finished Good** thường có **Manufacture** (sản phẩm được sản xuất)
3. **Raw Material** phải có **Stockable** và **Purchase** (nguyên liệu phải mua và lưu kho)
4. **Asset** phải có **Asset** và **Accounting** (tài sản phải khấu hao)
5. **Tool** phải có **Maintenance** (công cụ cần bảo trì)

### Xử lý trong hệ thống:

- Khi chọn Product Type, hệ thống sẽ tự động bật/tắt các Features phù hợp
- Nếu người dùng thay đổi Features không phù hợp với Type, hệ thống sẽ cảnh báo hoặc tự động điều chỉnh
- Validation sẽ kiểm tra tính hợp lệ của cấu hình trước khi lưu

---

## Tóm tắt

- **Master**: Template chung của sản phẩm
- **Variant**: Biến thể cụ thể (tối thiểu 1, tối đa 20)
- **Product Type**: Phân loại sản phẩm (7 loại)
- **Features**: Tính năng/module mà sản phẩm có thể sử dụng (8 tính năng)
- **Ràng buộc**: Type và Features phải phù hợp với nhau theo quy tắc nghiệp vụ`;

export default function ProductFormGuideModal({
  isOpen,
  onClose,
}: ProductFormGuideModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="5xl"
      onClose={onClose}
    >
      <ModalContent className="max-h-[90vh]">
        <>
          <ModalHeader className="flex items-center gap-2 pb-3">
            <HelpCircle size={18} />
            <span className="text-base">Thông tin cần biết</span>
          </ModalHeader>
          <ModalBody className="pb-4 pt-2">
            <MarkdownContent content={guideContent} />
          </ModalBody>
        </>
      </ModalContent>
    </Modal>
  );
}
