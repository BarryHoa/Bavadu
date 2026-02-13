# Hướng dẫn Thiết kế Form theo Chuẩn UX/UI Best Practices

Tài liệu tổng hợp các quy tắc thiết kế form thân thiện với người dùng, từ tổng quan đến chi tiết từng loại field, có giải thích lý do và dẫn chứng từ các nguồn uy tín.

---

## Mục lục

**Phần I – Tổng quan**
1. [Tổng quan](#1-tổng-quan)
2. [Phân loại form theo bố cục](#2-phân-loại-form-theo-bố-cục)

**Phần II – Cấu trúc và Bố cục**
3. [Cấu trúc Form – Container, Chia cột, Section](#3-cấu-trúc-form--container-chia-cột-section)
4. [Spacing và Whitespace](#4-spacing-và-whitespace)

**Phần III – Quy tắc chung**
5. [Quy tắc chung](#5-quy-tắc-chung)
6. [Typography và Visual States](#6-typography-và-visual-states)

**Phần IV – Chi tiết theo loại Field**
7. [Field Text và Email](#7-field-text-và-email)
8. [Field Number](#8-field-number)
9. [Field Date](#9-field-date)
10. [Field Số điện thoại (Phone)](#10-field-số-điện-thoại-phone)
11. [Field Mật khẩu (Password)](#11-field-mật-khẩu-password)
12. [Field Textarea](#12-field-textarea)
13. [Select / Dropdown](#13-select--dropdown)
14. [Checkbox và Radio (chi tiết)](#14-checkbox-và-radio-chi-tiết)
15. [Autocomplete](#15-autocomplete)
16. [Field File Upload](#16-field-file-upload)
17. [Character limit và Maxlength](#17-character-limit-và-maxlength)

**Phần V – Kích thước, Thứ tự, Help**
18. [Kích thước Input và Touch Targets](#18-kích-thước-input-và-touch-targets)
19. [Thứ tự và Cấu trúc Field](#19-thứ-tự-và-cấu-trúc-field)
20. [Helper Text và Help](#20-helper-text-và-help)

**Phần VI – Validation, Buttons, Accessibility**
21. [Validation và Error Handling](#21-validation-và-error-handling)
22. [Buttons](#22-buttons)
23. [Keyboard, Tab order, Autocomplete attribute](#23-keyboard-tab-order-autocomplete-attribute)

**Phần VII – Các pattern khác**
24. [Progressive Disclosure](#24-progressive-disclosure)
25. [Số lượng Field và Conversion](#25-số-lượng-field-và-conversion)
26. [Quy tắc riêng theo loại form](#26-quy-tắc-riêng-theo-loại-form)
27. [Tránh sai lầm phổ biến](#27-tránh-sai-lầm-phổ-biến)
28. [Nguồn tham khảo](#28-nguồn-tham-khảo)

---

## 1. Tổng quan

### 1.1 Mục đích tài liệu

Tài liệu này cung cấp:

- Quy tắc chung và quy tắc chi tiết theo từng loại field
- Hướng dẫn cấu trúc, bố cục, chia cột
- Giải thích **tại sao** cần làm theo từng quy tắc
- Dẫn chứng từ nghiên cứu, design system và tài liệu UX uy tín

### 1.2 Tại sao thiết kế form quan trọng?

Nghiên cứu của Seckler và cộng sự (CHI 2014) cho thấy: khi form tuân thủ các guideline usability cơ bản, **78%** người dùng submit thành công ngay lần đầu; với form vi phạm guideline, tỷ lệ này chỉ còn **42%**.

> Nguồn: Mirjam Seckler et al., "Designing usable web forms: empirical evaluation of web form improvement guidelines", SIGCHI Conference on Human Factors in Computing Systems 2014.

Gần 70% người dùng bỏ form khi form gây khó hiểu hoặc thất vọng. Thiết kế form kém làm giảm conversion, tăng thời gian hoàn thành và tạo trải nghiệm tiêu cực.

### 1.3 Nguyên tắc cốt lõi (2024+)

- **Giảm effort**: Chỉ hỏi thông tin cần thiết; dùng smart defaults, autocomplete, input phù hợp thiết bị
- **Rõ ràng**: Label đơn giản, ví dụ cụ thể; không dùng placeholder thay label
- **Ngăn lỗi sớm**: Validate inline (on blur), hướng dẫn cụ thể
- **Accessibility**: Semantic HTML, label hiển thị, tuân thủ WCAG 2.2
- **Tôn trọng quyền riêng tư**: Thu thập tối thiểu, giải thích mục đích

**Dẫn chứng:** FormCreatorAI – Web Form Design Best Practices; Interaction Design Foundation – UI Form Design; Primer – Forms

---

## 2. Phân loại form theo bố cục

```mermaid
flowchart TD
    Forms[Form]
    Forms --> Short[Form ngắn / Inline]
    Forms --> Modal[Form modal / Quick]
    Forms --> FullPage[Form full-page]
    Forms --> MultiStep[Form multi-step / Wizard]

    Short --> ShortDesc[1 đến 3 fields, search, filter]
    Modal --> ModalDesc[Pop-up, giữ context trang nền]
    FullPage --> FullDesc[Đăng ký, tạo record, form dài]
    MultiStep --> MultiDesc[Nhiều bước, chia nhóm logic]
```

| Loại form | Số lượng field | Bối cảnh | Ví dụ |
|-----------|----------------|----------|-------|
| **Form ngắn / Inline** | 1–3 | Tìm kiếm, lọc, đăng nhập | Search bar, filter, login |
| **Form modal** | Thường &lt; 5–6 | Task nhỏ, giữ context | Tạo Contact nhanh, xác nhận |
| **Form full-page** | Bất kỳ | Đăng ký, tạo record | Tạo Department, đăng ký tài khoản |
| **Form multi-step (Wizard)** | Nhiều, chia nhóm | Form dài, thứ tự logic | Đăng ký vay, khảo sát |

### 2.1 Khi nào dùng Modal vs Full-page?

**Modal:** Task nhỏ (&lt; 5–6 field), cần giữ context nền, hành động bổ sung.

**Full-page:** Form nhiều field, user cần nhớ thông tin từ màn trước, không cần gián đoạn luồng.

**Dẫn chứng:** UX Planet – Modal vs Page; UX Stack Exchange – Forms: Modal dialog or separate page?

---

## 3. Cấu trúc Form – Container, Chia cột, Section

### 3.1 Max-width container

**Quy tắc:** Max-width form **40–50em** (đơn vị tương đối). Tránh form full-width trên màn hình lớn.

**Tại sao:** Độ dài dòng 45–75 ký tự (tối đa ~80) tốt cho đọc. `em` scale theo font size của user.

**Thực hành:** Mobile dùng 100% width; min-width ~320px.

**Dẫn chứng:** UX Stack Exchange – Suggestion required for max width of a form; Newtarget – Max-Content Width

### 3.2 Chia cột (Column layout)

**Nguyên tắc chung:** Ưu tiên **single-column**. Form 1 cột hoàn thành nhanh hơn ~15.4 giây so với multi-column (CXL, 95% confidence).

**Khi được phép 2 cột:** Chỉ khi các field **liên quan chặt**:
- City + State + Zip
- First Name + Last Name
- Start date + End date
- Parent + Level (hierarchy)

**Hướng đọc:** Luồng **dọc trước** (top-to-bottom) rồi mới sang cột kế bên. Dùng visual separator giữa hai cột.

**Cảnh báo:** Tránh 2 cột với form dài (20+ field) – user dễ bỏ qua cột phải. Trên mobile chuyển về 1 cột.

**Dẫn chứng:** Caroline Jarrett – Two-column forms best avoided; UX Stack Exchange – 2 column form logical order

### 3.3 Form Section và Divider

**Quy tắc:**
- Nhóm field theo **chủ đề logic** với heading rõ ràng
- Dùng `<fieldset>` + `<legend>` cho accessibility
- Divider (line) hoặc spacer giữa section; tối đa 3 cấp heading

**Tại sao:** Cấu trúc rõ ràng giúp quét nhanh và hỗ trợ screen reader.

**Dẫn chứng:** W3C – Grouping Controls; ActivityInfo – Section header field

---

## 4. Spacing và Whitespace

### 4.1 Nguyên tắc Proximity (Gestalt)

Các phần tử **gần nhau** được nhận thức là **liên quan**. Label phải gần field của nó hơn field khác.

### 4.2 Macro vs Micro whitespace

- **Macro**: Khoảng cách giữa section, margin quanh form
- **Micro**: Padding trong input, khoảng cách label–field, line-height

### 4.3 Tác động

Whitespace hợp lý có thể tăng comprehension ~20% và conversion từ ~6% lên hơn 15%. Dùng grid 4px hoặc 8px.

**Dẫn chứng:** NN/G – Form Design White Space; UsePixelForm – Using Whitespace and Layout

---

## 5. Quy tắc chung

### 5.1 Label – Đặt trên input, không dùng placeholder thay label

**Quy tắc:** Mỗi input có label rõ ràng **phía trên** field. Không dùng placeholder thay label.

**Tại sao:** Placeholder biến mất khi gõ, độ tương phản thấp, screen reader không đọc; user dễ nhầm.

**Dẫn chứng:** NN/G – Placeholders in Form Fields Are Harmful; Adam Silver – The problem with placeholders

### 5.2 Layout – Ưu tiên single-column

Sắp xếp fields một cột dọc. Ngoại lệ: City+State+Zip, Start+End date có thể cùng hàng trên desktop.

### 5.3 Required / Optional

Đánh dấu **optional** khi đa số là required. Tránh hướng dẫn chung ở đầu form. Giảm optional field tối đa.

**Dẫn chứng:** NN/G – Marking Required Fields; UXD World – Required and Optional Fields

### 5.4 Button text – Động từ mô tả hành động

Dùng "Tạo phòng ban", "Lưu thay đổi" thay vì "Submit", "Gửi".

### 5.5 Vị trí Label

Label **phía trên** field là tốt nhất cho hầu hết form, đặc biệt mobile. Label bên trái tiết kiệm chiều dọc nhưng chậm hơn.

**Dẫn chứng:** Baymard – Label Position; UXmatters – Label Placement in Forms

---

## 6. Typography và Visual States

### 6.1 Typography

| Thành phần | Font size | Ghi chú |
|------------|-----------|---------|
| Label | 12px / 0.75rem | Regular weight |
| Nội dung input | 14px / 0.875rem | Regular |
| Helper/Error | 12px / 0.75rem | Regular |
| Section heading | 16–18px | Semibold |

Label: sentence case, ngắn gọn (≤3 từ). Khoảng cách dọc giữa field: ~32px.

**Dẫn chứng:** Carbon Design System – Form style; web.dev – Design basics; Primer – Forms

### 6.2 Border input

Input cần **border rõ ràng** để trông như control tương tác. Border mặc định browser thường quá nhạt, ảnh hưởng usability trên mobile. Dùng `border: 1px solid` với màu đủ tương phản.

**Dẫn chứng:** web.dev – Styling forms; W3C Design System – Forms

### 6.3 Focus state

**Quy tắc:** Có focus indicator rõ (outline hoặc box-shadow). Dùng `:focus-visible` thay vì `:focus` – hiện khi dùng keyboard, ẩn khi click chuột.

**Tại sao:** Người dùng keyboard cần biết vị trí focus. WCAG 2.2 yêu cầu focus rõ ràng. Không gỡ focus nếu không có thay thế.

**Dẫn chứng:** WICG – focus-visible; Cr0x – Accessible Focus States; Bootstrap – Focus ring

### 6.4 Disabled state

**Quy tắc:** Tránh chỉ dùng màu xám – dễ nhầm với nút secondary. Cân nhắc **giảm opacity** (&lt; 40%) thay vì đổi màu hẳn.

**Tại sao:** Opacity tạo chuyển đổi mượt hơn; màu xám khiến nút "nổi" và dễ bị click nhầm.

**Dẫn chứng:** UX Movement – Why You Shouldn't Gray Out Disabled Buttons; Smashing Magazine – Usability Pitfalls of Disabled Buttons

---

## 7. Field Text và Email

### 7.1 Text

Label trên field; chiều rộng phù hợp độ dài dự kiến; không dùng placeholder thay label.

### 7.2 Email

**Quy tắc:**
- Dùng `<input type="email">` – keyboard phù hợp mobile, validation cơ bản
- Kết hợp client-side + server-side validation
- `autocomplete="email"` cho WCAG

**Dẫn chứng:** WebAIM – Form Validation; W3C – Validating Input; UXPin – Accessible Form Validation

---

## 8. Field Number

### 8.1 Width

Tương ứng độ dài dự kiến: 75–100px (số ngắn), 150px (trung bình), 200–250px (dài).

### 8.2 Text alignment

**Căn phải (right-align)** khi so sánh nhiều số (vd: bảng tài chính). **Căn trái** khi form đa dạng, ưu tiên đồng bộ với text field.

**Dẫn chứng:** UX Stack Exchange – Why aren't number inputs right aligned

### 8.3 Standard width (FCC Design Standards)

| Size | Width |
|------|-------|
| Extra Small | 75px |
| Small | 150px |
| Medium | 250px |
| Large | 350px |
| Fill | 100% |

---

## 9. Field Date

### 9.1 Width

Single field: 150–250px. Date range: hai field cùng hàng desktop, mỗi cái ~150–200px.

### 9.2 Pattern theo context

| Context | Pattern |
|---------|---------|
| Ngày gần (&lt; 1 năm) | Calendar picker |
| Ngày xa (vd: năm sinh) | Cho phép gõ |
| Ít option (3–10 ngày) | Danh sách lựa chọn |

### 9.3 NN/G – Date Input Guidelines

- **Tránh** split dropdown (tháng/ngày/năm riêng) – tăng interaction cost
- **Tránh** scrolling picker trên mobile cho ngày xa
- **Luôn cho phép gõ** ngày
- **Không ép format** – chấp nhận 9-3-17, 09/03/17
- User quốc tế: label rõ (Month, Day) hoặc viết tên tháng
- Ngày không hợp lệ: disable hoặc làm rõ

**Dẫn chứng:** NN/G – [Date-Input Form Fields](https://www.nngroup.com/articles/date-input/); PatternFly – Date Picker

---

## 10. Field Số điện thoại (Phone)

**Quy tắc:**
- Chuẩn E.164: country code + tối đa 15 số
- Country dropdown + 1 field nhập số
- `autocomplete="tel"`
- Chấp nhận format linh hoạt (dấu cách, gạch); validate server-side

**Dẫn chứng:** Base Web – Building an International Phone Input; UX Patterns – Phone Number

---

## 11. Field Mật khẩu (Password)

**Quy tắc:**
- Có nút **show/hide** password
- Hiển thị yêu cầu **trước** khi nhập
- `aria-describedby` gắn yêu cầu với input
- Không tắt autofill trừ khi lý do bảo mật rõ ràng

**Tại sao:** Giúp kiểm tra nhập đúng; hữu ích cho người khuyết tật.

**Dẫn chứng:** UX Patterns – Password; Makethingsaccessible – Accessible password reveal input

---

## 12. Field Textarea

**Quy tắc:**
- Dùng `rows`/`cols` (HTML) và CSS; `cols` kém tin cậy nên ưu tiên CSS
- Ví dụ: `width: 300px`, `height: 150px`; responsive trên mobile
- Autoresize: tăng height theo nội dung, có `minRows` và `maxRows`

**Dẫn chứng:** UX Patterns – Textarea; MUI – Textarea Autosize

---

## 13. Select / Dropdown

### 13.1 Khi nào dùng

- **&lt; 6 options** → Radio buttons
- **7+ options** → Dropdown hoặc Autocomplete

### 13.2 Behavior

- Dùng **mousedown** thay vì click để mở – mở trước khi nhả chuột
- Khi mở: scroll đến item đang chọn
- Typeahead để tìm nhanh
- Trên mobile: ưu tiên native `<select>`
- Menu ~7 items trở xuống; nhiều hơn: nhóm hoặc scroll

**Dẫn chứng:** UI Playbook – Select; PatternFly – Select; NN/G – Dropdowns

---

## 14. Checkbox và Radio (chi tiết)

### 14.1 NN/G – Checkbox Guidelines

- **Hình dạng:** Vuông (có thể bo góc); **không** dùng hình tròn (dễ nhầm radio)
- **Label clickable** – vùng chạm ≥ 1cm x 1cm
- **Label tránh phủ định** – "Gửi cập nhật" thay vì "Không gửi cập nhật"
- **Checkbox list:** Xếp **dọc**, không ngang
- Ghi rõ "Chọn tất cả phù hợp" hoặc "Chọn tối đa X"
- **Checkbox khuyến mãi/legal:** Mặc định **unchecked** (tránh deceptive pattern)

### 14.2 Nested checkbox

Parent + child; parent có trạng thái **indeterminate** (gạch) khi chỉ một phần con được chọn. Dùng khi nhiều user chọn "tất cả".

### 14.3 Radio vs Checkbox

- **Radio:** Chọn **một** (mutually exclusive)
- **Checkbox:** Chọn **nhiều** hoặc bật/tắt (boolean)

**Dẫn chứng:** NN/G – [Checkboxes: Design Guidelines](https://www.nngroup.com/articles/checkboxes-design-guidelines/); Canada.ca – Checkboxes and radio buttons

---

## 15. Autocomplete

**Khi dùng:** 10+ options, input có tập giá trị xác định (vd: thành phố, sản phẩm).

**Khi không:** &lt; 10 options; text tự do; mật khẩu; độ trễ mạng cao.

**Accessibility:** HTML `autocomplete`, ARIA; điều hướng phím (mũi tên, Enter).

---

## 16. Field File Upload

**Quy tắc:**
- Label rõ; helper text mô tả giới hạn (loại file, kích thước)
- Single upload mặc định; `multiple` khi cần
- Cân nhắc drag-and-drop
- Nút "Chọn file" / "Upload file" rõ ràng
- `accept` attribute; validate server-side
- Hiển thị progress và lỗi

**Dẫn chứng:** GOV.UK – File upload; UX Patterns – File Input; Michigan Design System – File Upload

---

## 17. Character limit và Maxlength

**Quy tắc:**
- Hiển thị giới hạn **từ đầu**, không chỉ khi submit
- Đếm: "X/Y ký tự" hoặc "Còn Y ký tự"
- Khi sắp chạm limit: đổi màu (vd: cam, đỏ)
- Vượt quá: "Vượt X ký tự" – rõ ràng

**Dẫn chứng:** USWDS – Character count; UX Stack Exchange – Text box max character limit

---

## 18. Kích thước Input và Touch Targets

### 18.1 Chiều rộng

Tương ứng độ dài dự kiến. Cân bằng giữa đúng kích thước và **đồng nhất** – form đồng đều trông chuyên nghiệp hơn.

### 18.2 Touch target (Mobile)

**WCAG 2.1/2.2 (AAA):** Tối thiểu **44x44 CSS pixels**. Material Design: **48x48 dp**. Khoảng cách giữa target: 8px.

**Dẫn chứng:** W3C – Target Size; web.dev – Accessible tap targets

---

## 19. Thứ tự và Cấu trúc Field

- Nhóm theo **chủ đề logic**
- **Tổng quát → cụ thể** – bắt đầu câu hỏi rộng, dần sang riêng tư
- Luồng **logic** – thông tin này dẫn đến thông tin kia
- Giảm cognitive load với heading rõ ràng

**Dẫn chứng:** Formcentric – Getting the order right; NN/G – 4 Principles to Reduce Cognitive Load

---

## 20. Helper Text và Help

- Đặt **bên dưới** field: Label → Input → Helper text
- Dùng cho input phức tạp, ràng buộc, giới hạn ký tự
- **Tránh** tooltip thay helper text – helper text luôn hiển thị hiệu quả hơn

**Dẫn chứng:** UX Movement – Form Field Help Text; PatternFly – Helper Text

---

## 21. Validation và Error Handling

### 21.1 Inline validation

Hiển thị lỗi **dưới field** khi blur. Không validate khi đang gõ (trừ password strength).

### 21.2 10 guideline NN/G

1. Inline validation khi có thể
2. Chỉ báo thành công cho field phức tạp
3. Message ngay field – rõ ràng, có thể hành động
4. Màu + icon (không chỉ màu)
5. Icon hoặc animation nhẹ
6. Hạn chế modal cho lỗi
7. Không validate trước khi user xong
8. Không chỉ dùng validation summary
9. Tránh tooltip cho lỗi
10. Hỗ trợ khi lỗi lặp lại

**Dẫn chứng:** NN/G – [10 Design Guidelines for Reporting Errors in Forms](https://www.nngroup.com/articles/errors-forms-design-guidelines/); WebAIM – Form Validation

---

## 22. Buttons

### 22.1 Tránh Reset/Clear

Không dùng nút Reset/Clear – dễ nhấn nhầm, mất dữ liệu. Guideline hơn 15 năm.

### 22.2 Nút Back

Đặt **đầu trang** (trên form), không cạnh Submit. Gần vị trí nút Back trình duyệt.

### 22.3 Sticky submit button

**Không** nhân đôi nút Submit (trên + dưới). Nút chính ở **cuối form**. Nếu sticky header: cấu hình scroll offset.

**Dẫn chứng:** UX Stack Exchange – Sticky submit button; Australian Govt – Form: Sticky Button

### 22.4 Full-page: Primary trái; Modal: Primary phải

---

## 23. Keyboard, Tab order, Autocomplete attribute

### 23.1 Tab order

Thứ tự Tab = thứ tự DOM. Tránh `tabindex` dương. Không dùng layout table cho multi-column form.

### 23.2 Autocomplete attribute (WCAG)

Dùng `autocomplete` cho field thu thập thông tin user: `given-name`, `family-name`, `email`, `tel`, `street-address`. Đáp ứng WCAG 1.3.5 (Identify Input Purpose – AA).

**Dẫn chứng:** W3C – H4 Tab order; W3C – H98 autocomplete; WebAIM – Forms

---

## 24. Progressive Disclosure

Accordion/collapsible cho section ít quan trọng. Conditional fields – field con hiện khi chọn option; indent để thể hiện quan hệ. Dùng chevron + text.

**Dẫn chứng:** Primer – Progressive disclosure; PatternFly – Progressive Disclosure

---

## 25. Số lượng Field và Conversion

Không có con số "vàng". Chỉ hỏi thông tin cần thiết; A/B test. Chất lượng và sự liên quan quan trọng hơn số lượng.

---

## 26. Quy tắc riêng theo loại form

| Loại | Quy tắc |
|------|---------|
| **Form ngắn** | Button cạnh input; task đơn giản |
| **Modal** | Primary phải, Cancel trái; &lt; 5–6 field |
| **Full-page** | Primary trái; breadcrumb; section rõ |
| **Wizard** | ~5 field/bước; lưu và tiếp tục; progress |

---

## 27. Tránh sai lầm phổ biến

| Sai lầm | Đúng cách |
|---------|-----------|
| Placeholder thay label | Label rõ phía trên |
| Form nhiều cột phức tạp | Ưu tiên 1 cột |
| Nút "Submit" chung chung | "Tạo phòng ban", "Lưu thay đổi" |
| Validate khi đang gõ | Validate sau blur |
| Chỉ màu báo lỗi | Màu + icon + văn bản |
| Nút Reset/Clear | Tránh |
| Dropdown cho 2–3 options | Radio buttons |
| Helper text ẩn tooltip | Helper text luôn hiển thị |
| Touch target &lt; 44px | Tối thiểu 44x44px |
| Checkbox hình tròn | Vuông (tránh nhầm radio) |
| Checkbox label phủ định | "Gửi cập nhật" thay vì "Không gửi" |
| Split date dropdown | Cho phép gõ; calendar khi cần |
| Gray out disabled | Cân nhắc giảm opacity |

---

## 28. Nguồn tham khảo

### Nghiên cứu & UX
- **NN/G:** Web Form Design, Errors in Forms, Placeholders, Required Fields, Form Design White Space, Checkboxes, Date Input, Dropdowns
- **GOV.UK:** Form structure, Design System, File upload
- **Adam Silver:** Where to put buttons, Placeholders, Multi-column, Back button
- **Caroline Jarrett / Effortmark:** Label placement, Reset button, Two-column forms
- **Baymard Institute:** Mobile form usability, Input fields
- **FormAssembly:** Multi-step form best practices

### Design Systems
- **Material Design:** Buttons, Dialog
- **PatternFly:** Modal, Wizard, Select, Helper Text, Progressive Disclosure, Date Picker
- **Carbon (IBM):** Spacing, Forms
- **Primer (GitHub):** Autocomplete, Progressive disclosure, Forms
- **Atlassian:** Forms pattern

### Standards & Accessibility
- **W3C:** Multi-page forms, Labels, Target Size (WCAG 2.5.5), H98 autocomplete, Grouping
- **WebAIM:** Form validation and error recovery
- **web.dev:** Form design basics, Styling forms, Accessible tap targets

### Khác
- **CXL / Foxit:** Single-column vs multi-column
- **UX Movement:** Helper text, Multi-column, Optional fields, Disabled buttons
- **UX Planet:** Modal vs Page
- **FormCreatorAI, Interaction Design Foundation:** Form design 2024+
