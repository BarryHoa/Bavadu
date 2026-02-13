# IBasePageLayout RFT – Trạng thái

Rà soát toàn bộ module – áp dụng **IBasePageLayout** cho mọi trang Create / Edit / View (Detail) theo chuẩn Department.

## Chuẩn (reference)

- **Create:** `IBasePageLayout variant="create" maxWidth="form" title={...}` → children = Form. `useSetBreadcrumbs([list, pageTitle])`.
- **Edit:** `IBasePageLayout variant="edit" maxWidth="form" title={...} subtitle={code/identifier}` → children = Form. Loading: `IBaseSpinner`; Error: card danger + Retry. Breadcrumbs: list → entity (link view) → edit.
- **View/Detail:** `IBasePageLayout variant="detail" maxWidth="content" title={entityName} subtitle={...} headerActions={<Edit button>}` → children = `IBaseCard` (border, shadow). Breadcrumbs: list → entity.

## Bảng rà soát đầy đủ

| Module | Entity | Create | Edit | View/Detail | Ghi chú |
|--------|--------|--------|------|-------------|--------|
| **HRM** | Department | ✅ | ✅ | ✅ | Chuẩn |
| **HRM** | Position | ✅ | ✅ | ✅ | |
| **HRM** | Employee | ✅ | ✅ | ✅ | |
| **HRM** | LeaveRequest | ✅ | ✅ | ✅ | |
| **HRM** | LeaveType | ✅ | ✅ | ✅ | |
| **HRM** | JobRequisition | ✅ | ✅ | ✅ | |
| **HRM** | Timesheet | ✅ | ✅ | ✅ | |
| **HRM** | PerformanceReview | ✅ | ✅ | ✅ | |
| **HRM** | Payroll | ✅ | ✅ | ✅ | |
| **HRM** | Course | ✅ | ✅ | ✅ | |
| **HRM** | Contract | ✅ | ✅ | ✅ | |
| **HRM** | Certificate | ✅ | ✅ | ✅ | |
| **HRM** | Candidate | ✅ | ✅ | ✅ | |
| **Product** | Product | ❌ | ❌ | ❌ | ProductsCreatePage, Edit, View |
| **Product** | ProductCategory | ❌ | ❌ | ❌ | Create, Edit, DetailPage |
| **Stock** | Warehouse | ❌ | ❌ | — | Chỉ Create, Edit (không có View) |
| **Purchase** | PurchaseOrder | ❌ | — | ❌ | CreatePage, DetailPage (không Edit) |
| **B2C** | PriceListB2C | ❌ | ❌ | ❌ | |
| **B2C** | SalesOrderB2C | ❌ | ❌ | ❌ | CreateClient, Edit, View |
| **B2C** | CustomerIndividual | ❌ | ❌ | ❌ | |
| **B2C** | Delivery | ❌ | — | — | CreateDeliveryPage |
| **B2B** | CustomerCompany | ❌ | ❌ | ❌ | |
| **B2B** | SalesOrderB2B | ❌ | ❌ | ❌ | |
| **B2B** | Delivery | ❌ | — | — | CreateDeliveryPage |
| **module-base** | Settings/Roles | ❌ | ❌ | ❌ | RoleCreatePage, RoleEditPage, RoleViewPage |

**Tổng:** ~39 trang đã RFT (toàn bộ HRM), **~26 trang** chưa RFT (Product, Stock, Purchase, B2C, B2B, Settings).

## Đường dẫn file (chưa RFT)

- **HRM (đã RFT):** Timesheet, PerformanceReview, Payroll, Course, Contract, Certificate, Candidate (Create/Edit/View).
- **Product:** `ProductsCreatePage.tsx`, `ProductsEditPage.tsx`, `ProductsViewPage.tsx`; `ProductCategoryCreatePage.tsx`, `ProductCategoryEditPage.tsx`, `ProductCategoryDetailPage.tsx`
- **Stock:** `WarehouseCreatePage.tsx`, `WarehouseEditPage.tsx`
- **Purchase:** `PurchaseOrderCreatePage.tsx`, `PurchaseOrderDetailPage.tsx`
- **B2C:** `PriceListB2CCreatePage.tsx`, `PriceListB2CEditPage.tsx`, `PriceListB2CViewPage.tsx`; `SalesOrderB2CCreatePageClient.tsx`, `SalesOrderB2CEditPage.tsx`, `SalesOrderB2CViewPage.tsx`; `CustomerIndividualCreatePage.tsx`, `CustomerIndividualEditPage.tsx`, `CustomerIndividualViewPage.tsx`; `CreateDeliveryPage.tsx`
- **B2B:** `CustomerCompanyCreatePage.tsx`, `CustomerCompanyEditPage.tsx`, `CustomerCompanyViewPage.tsx`; `SalesOrderB2BCreatePage.tsx`, `SalesOrderB2BEditPage.tsx`, `SalesOrderB2BViewPage.tsx`; `CreateDeliveryPage.tsx`
- **module-base:** `RoleCreatePage.tsx`, `RoleEditPage.tsx`, `RoleViewPage.tsx`

## Cách làm mỗi trang

1. **Create (Client):** `LIST_PATH`, `useSetBreadcrumbs([list, t("create")])`, wrap Form với `<IBasePageLayout variant="create" maxWidth="form" title={t("create")}>`.
2. **Edit:** Breadcrumbs (list → entity → edit). Loading: `IBaseSpinner`. Error: card danger + Retry. Wrap Form với `<IBasePageLayout variant="edit" maxWidth="form" title={t("edit")} subtitle={...}>`.
3. **View:** Breadcrumbs (list → entity). Loading/error như Edit. `<IBasePageLayout variant="detail" maxWidth="content" title={...} subtitle={...} headerActions={<Edit button Pencil />}>` + children = `IBaseCard` (border, shadow), bỏ sticky bar cũ.

Translation: thêm `edit` (và `create` / `pageTitle` nếu thiếu) trong en.json, vi.json.
