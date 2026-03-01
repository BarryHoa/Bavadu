-- Seed guideline: sequence-form (sidebar Tips/Guidelines cho form Create/Edit Sequence Rule)
-- Hiển thị bên phải form tại Settings > Sequences > Create / Edit

INSERT INTO "md_base"."guidelines" (
  "key",
  "content",
  "created_at",
  "updated_at"
)
VALUES (
  'sequence-form',
  '## Sequence Rule là gì?

**Sequence Rule** dùng để tự động sinh mã (code) theo format bạn cấu hình, ví dụ: mã nhân viên `NV-000001`, mã đơn hàng `ORD-000042`.

### Các trường chính

- **Code**: Mã duy nhất của rule, dùng khi gọi API sinh mã. Ví dụ: `employee_code`, `order_code`.
- **Display name**: Tên hiển thị (tùy chọn).
- **Prefix**: Chuỗi đứng trước phần số, ví dụ: `NV`, `ORD`.
- **Suffix**: Chuỗi đứng sau phần số (tùy chọn).
- **Format**: Cách format số. Mặc định `%06d` = 6 chữ số, pad zero (000001, 000002…).
- **Start**: Giá trị bắt đầu (thường là 1).
- **Step**: Bước nhảy mỗi lần (thường là 1).

### Kết quả sinh mã

Công thức: `[Prefix]-[Số theo Format]-[Suffix]`

Ví dụ với Prefix=`NV`, Format=`%06d`, Start=1:
- Lần 1: `NV-000001`
- Lần 2: `NV-000002`
- …

### Sử dụng trong code

Trong form hoặc service, gọi:

```
sequenceService.getNext("employee_code")
```

→ Trả về chuỗi mã tiếp theo (ví dụ `NV-000003`) và tăng **Current value** cho rule đó.

### Lưu ý khi chỉnh sửa

- **Chưa có bản ghi nào dùng rule** (Counts = 0): Có thể sửa mọi trường, hoặc xóa rule.
- **Đã có ít nhất một bản ghi** (Counts > 0): Chỉ được sửa **Tên hiển thị**, **Mô tả**, **Trạng thái (Active/Inactive)**. Không được đổi Code, Prefix, Suffix, Format, Start, Step để tránh lệch dữ liệu.',
  NOW(),
  NOW()
)
ON CONFLICT ("key") DO UPDATE SET
  "content" = EXCLUDED."content",
  "updated_at" = NOW();
