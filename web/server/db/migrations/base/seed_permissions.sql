-- Migration: Seed permissions for all modules
-- Tạo các permissions cho tất cả modules trong hệ thống

-- ============================================
-- Base Module Permissions
-- ============================================

-- Users
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES 
('base.user.view', 'base', 'user', 'view', '{"en": "View Users", "vi": "Xem người dùng"}', '{"en": "Permission to view users", "vi": "Quyền xem người dùng"}', true, now()),
('base.user.create', 'base', 'user', 'create', '{"en": "Create Users", "vi": "Tạo người dùng"}', '{"en": "Permission to create users", "vi": "Quyền tạo người dùng"}', true, now()),
('base.user.update', 'base', 'user', 'update', '{"en": "Update Users", "vi": "Cập nhật người dùng"}', '{"en": "Permission to update users", "vi": "Quyền cập nhật người dùng"}', true, now()),
('base.user.delete', 'base', 'user', 'delete', '{"en": "Delete Users", "vi": "Xóa người dùng"}', '{"en": "Permission to delete users", "vi": "Quyền xóa người dùng"}', true, now()),
('base.user.print', 'base', 'user', 'print', '{"en": "Print Users", "vi": "In người dùng"}', '{"en": "Permission to print users", "vi": "Quyền in người dùng"}', true, now()),
('base.user.export', 'base', 'user', 'export', '{"en": "Export Users", "vi": "Xuất người dùng"}', '{"en": "Permission to export users", "vi": "Quyền xuất người dùng"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- Roles
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES 
('base.role.view', 'base', 'role', 'view', '{"en": "View Roles", "vi": "Xem vai trò"}', '{"en": "Permission to view roles", "vi": "Quyền xem vai trò"}', true, now()),
('base.role.create', 'base', 'role', 'create', '{"en": "Create Roles", "vi": "Tạo vai trò"}', '{"en": "Permission to create roles", "vi": "Quyền tạo vai trò"}', true, now()),
('base.role.update', 'base', 'role', 'update', '{"en": "Update Roles", "vi": "Cập nhật vai trò"}', '{"en": "Permission to update roles", "vi": "Quyền cập nhật vai trò"}', true, now()),
('base.role.delete', 'base', 'role', 'delete', '{"en": "Delete Roles", "vi": "Xóa vai trò"}', '{"en": "Permission to delete roles", "vi": "Quyền xóa vai trò"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- ============================================
-- HRM Module Permissions
-- ============================================

-- Employees
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES 
('hrm.employee.view', 'hrm', 'employee', 'view', '{"en": "View Employees", "vi": "Xem nhân viên"}', '{"en": "Permission to view employees", "vi": "Quyền xem nhân viên"}', true, now()),
('hrm.employee.create', 'hrm', 'employee', 'create', '{"en": "Create Employees", "vi": "Tạo nhân viên"}', '{"en": "Permission to create employees", "vi": "Quyền tạo nhân viên"}', true, now()),
('hrm.employee.update', 'hrm', 'employee', 'update', '{"en": "Update Employees", "vi": "Cập nhật nhân viên"}', '{"en": "Permission to update employees", "vi": "Quyền cập nhật nhân viên"}', true, now()),
('hrm.employee.delete', 'hrm', 'employee', 'delete', '{"en": "Delete Employees", "vi": "Xóa nhân viên"}', '{"en": "Permission to delete employees", "vi": "Quyền xóa nhân viên"}', true, now()),
('hrm.employee.print', 'hrm', 'employee', 'print', '{"en": "Print Employees", "vi": "In nhân viên"}', '{"en": "Permission to print employees", "vi": "Quyền in nhân viên"}', true, now()),
('hrm.employee.export', 'hrm', 'employee', 'export', '{"en": "Export Employees", "vi": "Xuất nhân viên"}', '{"en": "Permission to export employees", "vi": "Quyền xuất nhân viên"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- Departments
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES 
('hrm.department.view', 'hrm', 'department', 'view', '{"en": "View Departments", "vi": "Xem phòng ban"}', '{"en": "Permission to view departments", "vi": "Quyền xem phòng ban"}', true, now()),
('hrm.department.create', 'hrm', 'department', 'create', '{"en": "Create Departments", "vi": "Tạo phòng ban"}', '{"en": "Permission to create departments", "vi": "Quyền tạo phòng ban"}', true, now()),
('hrm.department.update', 'hrm', 'department', 'update', '{"en": "Update Departments", "vi": "Cập nhật phòng ban"}', '{"en": "Permission to update departments", "vi": "Quyền cập nhật phòng ban"}', true, now()),
('hrm.department.delete', 'hrm', 'department', 'delete', '{"en": "Delete Departments", "vi": "Xóa phòng ban"}', '{"en": "Permission to delete departments", "vi": "Quyền xóa phòng ban"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- Payroll
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES 
('hrm.payroll.view', 'hrm', 'payroll', 'view', '{"en": "View Payroll", "vi": "Xem lương"}', '{"en": "Permission to view payroll", "vi": "Quyền xem lương"}', true, now()),
('hrm.payroll.create', 'hrm', 'payroll', 'create', '{"en": "Create Payroll", "vi": "Tạo lương"}', '{"en": "Permission to create payroll", "vi": "Quyền tạo lương"}', true, now()),
('hrm.payroll.update', 'hrm', 'payroll', 'update', '{"en": "Update Payroll", "vi": "Cập nhật lương"}', '{"en": "Permission to update payroll", "vi": "Quyền cập nhật lương"}', true, now()),
('hrm.payroll.approve', 'hrm', 'payroll', 'approve', '{"en": "Approve Payroll", "vi": "Phê duyệt lương"}', '{"en": "Permission to approve payroll", "vi": "Quyền phê duyệt lương"}', true, now()),
('hrm.payroll.print', 'hrm', 'payroll', 'print', '{"en": "Print Payroll", "vi": "In lương"}', '{"en": "Permission to print payroll", "vi": "Quyền in lương"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- Leave Requests
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES 
('hrm.leave_request.view', 'hrm', 'leave_request', 'view', '{"en": "View Leave Requests", "vi": "Xem đơn nghỉ phép"}', '{"en": "Permission to view leave requests", "vi": "Quyền xem đơn nghỉ phép"}', true, now()),
('hrm.leave_request.create', 'hrm', 'leave_request', 'create', '{"en": "Create Leave Requests", "vi": "Tạo đơn nghỉ phép"}', '{"en": "Permission to create leave requests", "vi": "Quyền tạo đơn nghỉ phép"}', true, now()),
('hrm.leave_request.approve', 'hrm', 'leave_request', 'approve', '{"en": "Approve Leave Requests", "vi": "Phê duyệt đơn nghỉ phép"}', '{"en": "Permission to approve leave requests", "vi": "Quyền phê duyệt đơn nghỉ phép"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- ============================================
-- Product Module Permissions
-- ============================================

-- Products
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES 
('product.product.view', 'product', 'product', 'view', '{"en": "View Products", "vi": "Xem sản phẩm"}', '{"en": "Permission to view products", "vi": "Quyền xem sản phẩm"}', true, now()),
('product.product.create', 'product', 'product', 'create', '{"en": "Create Products", "vi": "Tạo sản phẩm"}', '{"en": "Permission to create products", "vi": "Quyền tạo sản phẩm"}', true, now()),
('product.product.update', 'product', 'product', 'update', '{"en": "Update Products", "vi": "Cập nhật sản phẩm"}', '{"en": "Permission to update products", "vi": "Quyền cập nhật sản phẩm"}', true, now()),
('product.product.delete', 'product', 'product', 'delete', '{"en": "Delete Products", "vi": "Xóa sản phẩm"}', '{"en": "Permission to delete products", "vi": "Quyền xóa sản phẩm"}', true, now()),
('product.product.print', 'product', 'product', 'print', '{"en": "Print Products", "vi": "In sản phẩm"}', '{"en": "Permission to print products", "vi": "Quyền in sản phẩm"}', true, now()),
('product.product.export', 'product', 'product', 'export', '{"en": "Export Products", "vi": "Xuất sản phẩm"}', '{"en": "Permission to export products", "vi": "Quyền xuất sản phẩm"}', true, now()),
('product.product.import', 'product', 'product', 'import', '{"en": "Import Products", "vi": "Nhập sản phẩm"}', '{"en": "Permission to import products", "vi": "Quyền nhập sản phẩm"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- Product Categories
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES 
('product.category.view', 'product', 'category', 'view', '{"en": "View Categories", "vi": "Xem danh mục"}', '{"en": "Permission to view categories", "vi": "Quyền xem danh mục"}', true, now()),
('product.category.create', 'product', 'category', 'create', '{"en": "Create Categories", "vi": "Tạo danh mục"}', '{"en": "Permission to create categories", "vi": "Quyền tạo danh mục"}', true, now()),
('product.category.update', 'product', 'category', 'update', '{"en": "Update Categories", "vi": "Cập nhật danh mục"}', '{"en": "Permission to update categories", "vi": "Quyền cập nhật danh mục"}', true, now()),
('product.category.delete', 'product', 'category', 'delete', '{"en": "Delete Categories", "vi": "Xóa danh mục"}', '{"en": "Permission to delete categories", "vi": "Quyền xóa danh mục"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- ============================================
-- B2B Sales Module Permissions
-- ============================================

-- B2B Sales Orders
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES 
('b2b-sales.order.view', 'b2b-sales', 'order', 'view', '{"en": "View B2B Orders", "vi": "Xem đơn hàng B2B"}', '{"en": "Permission to view B2B orders", "vi": "Quyền xem đơn hàng B2B"}', true, now()),
('b2b-sales.order.create', 'b2b-sales', 'order', 'create', '{"en": "Create B2B Orders", "vi": "Tạo đơn hàng B2B"}', '{"en": "Permission to create B2B orders", "vi": "Quyền tạo đơn hàng B2B"}', true, now()),
('b2b-sales.order.update', 'b2b-sales', 'order', 'update', '{"en": "Update B2B Orders", "vi": "Cập nhật đơn hàng B2B"}', '{"en": "Permission to update B2B orders", "vi": "Quyền cập nhật đơn hàng B2B"}', true, now()),
('b2b-sales.order.delete', 'b2b-sales', 'order', 'delete', '{"en": "Delete B2B Orders", "vi": "Xóa đơn hàng B2B"}', '{"en": "Permission to delete B2B orders", "vi": "Quyền xóa đơn hàng B2B"}', true, now()),
('b2b-sales.order.approve', 'b2b-sales', 'order', 'approve', '{"en": "Approve B2B Orders", "vi": "Phê duyệt đơn hàng B2B"}', '{"en": "Permission to approve B2B orders", "vi": "Quyền phê duyệt đơn hàng B2B"}', true, now()),
('b2b-sales.order.print', 'b2b-sales', 'order', 'print', '{"en": "Print B2B Orders", "vi": "In đơn hàng B2B"}', '{"en": "Permission to print B2B orders", "vi": "Quyền in đơn hàng B2B"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- B2B Customers
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES 
('b2b-sales.customer.view', 'b2b-sales', 'customer', 'view', '{"en": "View B2B Customers", "vi": "Xem khách hàng B2B"}', '{"en": "Permission to view B2B customers", "vi": "Quyền xem khách hàng B2B"}', true, now()),
('b2b-sales.customer.create', 'b2b-sales', 'customer', 'create', '{"en": "Create B2B Customers", "vi": "Tạo khách hàng B2B"}', '{"en": "Permission to create B2B customers", "vi": "Quyền tạo khách hàng B2B"}', true, now()),
('b2b-sales.customer.update', 'b2b-sales', 'customer', 'update', '{"en": "Update B2B Customers", "vi": "Cập nhật khách hàng B2B"}', '{"en": "Permission to update B2B customers", "vi": "Quyền cập nhật khách hàng B2B"}', true, now()),
('b2b-sales.customer.delete', 'b2b-sales', 'customer', 'delete', '{"en": "Delete B2B Customers", "vi": "Xóa khách hàng B2B"}', '{"en": "Permission to delete B2B customers", "vi": "Quyền xóa khách hàng B2B"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- ============================================
-- B2C Sales Module Permissions
-- ============================================

-- B2C Sales Orders
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES 
('b2c-sales.order.view', 'b2c-sales', 'order', 'view', '{"en": "View B2C Orders", "vi": "Xem đơn hàng B2C"}', '{"en": "Permission to view B2C orders", "vi": "Quyền xem đơn hàng B2C"}', true, now()),
('b2c-sales.order.create', 'b2c-sales', 'order', 'create', '{"en": "Create B2C Orders", "vi": "Tạo đơn hàng B2C"}', '{"en": "Permission to create B2C orders", "vi": "Quyền tạo đơn hàng B2C"}', true, now()),
('b2c-sales.order.update', 'b2c-sales', 'order', 'update', '{"en": "Update B2C Orders", "vi": "Cập nhật đơn hàng B2C"}', '{"en": "Permission to update B2C orders", "vi": "Quyền cập nhật đơn hàng B2C"}', true, now()),
('b2c-sales.order.delete', 'b2c-sales', 'order', 'delete', '{"en": "Delete B2C Orders", "vi": "Xóa đơn hàng B2C"}', '{"en": "Permission to delete B2C orders", "vi": "Quyền xóa đơn hàng B2C"}', true, now()),
('b2c-sales.order.print', 'b2c-sales', 'order', 'print', '{"en": "Print B2C Orders", "vi": "In đơn hàng B2C"}', '{"en": "Permission to print B2C orders", "vi": "Quyền in đơn hàng B2C"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- B2C Price Lists
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES 
('b2c-sales.price_list.view', 'b2c-sales', 'price_list', 'view', '{"en": "View Price Lists", "vi": "Xem bảng giá"}', '{"en": "Permission to view price lists", "vi": "Quyền xem bảng giá"}', true, now()),
('b2c-sales.price_list.create', 'b2c-sales', 'price_list', 'create', '{"en": "Create Price Lists", "vi": "Tạo bảng giá"}', '{"en": "Permission to create price lists", "vi": "Quyền tạo bảng giá"}', true, now()),
('b2c-sales.price_list.update', 'b2c-sales', 'price_list', 'update', '{"en": "Update Price Lists", "vi": "Cập nhật bảng giá"}', '{"en": "Permission to update price lists", "vi": "Quyền cập nhật bảng giá"}', true, now()),
('b2c-sales.price_list.delete', 'b2c-sales', 'price_list', 'delete', '{"en": "Delete Price Lists", "vi": "Xóa bảng giá"}', '{"en": "Permission to delete price lists", "vi": "Quyền xóa bảng giá"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- ============================================
-- Purchase Module Permissions
-- ============================================

-- Purchase Orders
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES 
('purchase.order.view', 'purchase', 'order', 'view', '{"en": "View Purchase Orders", "vi": "Xem đơn mua hàng"}', '{"en": "Permission to view purchase orders", "vi": "Quyền xem đơn mua hàng"}', true, now()),
('purchase.order.create', 'purchase', 'order', 'create', '{"en": "Create Purchase Orders", "vi": "Tạo đơn mua hàng"}', '{"en": "Permission to create purchase orders", "vi": "Quyền tạo đơn mua hàng"}', true, now()),
('purchase.order.update', 'purchase', 'order', 'update', '{"en": "Update Purchase Orders", "vi": "Cập nhật đơn mua hàng"}', '{"en": "Permission to update purchase orders", "vi": "Quyền cập nhật đơn mua hàng"}', true, now()),
('purchase.order.approve', 'purchase', 'order', 'approve', '{"en": "Approve Purchase Orders", "vi": "Phê duyệt đơn mua hàng"}', '{"en": "Permission to approve purchase orders", "vi": "Quyền phê duyệt đơn mua hàng"}', true, now()),
('purchase.order.print', 'purchase', 'order', 'print', '{"en": "Print Purchase Orders", "vi": "In đơn mua hàng"}', '{"en": "Permission to print purchase orders", "vi": "Quyền in đơn mua hàng"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- ============================================
-- Stock Module Permissions
-- ============================================

-- Stock Movements
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES 
('stock.movement.view', 'stock', 'movement', 'view', '{"en": "View Stock Movements", "vi": "Xem nhập xuất kho"}', '{"en": "Permission to view stock movements", "vi": "Quyền xem nhập xuất kho"}', true, now()),
('stock.movement.create', 'stock', 'movement', 'create', '{"en": "Create Stock Movements", "vi": "Tạo nhập xuất kho"}', '{"en": "Permission to create stock movements", "vi": "Quyền tạo nhập xuất kho"}', true, now()),
('stock.movement.update', 'stock', 'movement', 'update', '{"en": "Update Stock Movements", "vi": "Cập nhật nhập xuất kho"}', '{"en": "Permission to update stock movements", "vi": "Quyền cập nhật nhập xuất kho"}', true, now()),
('stock.movement.approve', 'stock', 'movement', 'approve', '{"en": "Approve Stock Movements", "vi": "Phê duyệt nhập xuất kho"}', '{"en": "Permission to approve stock movements", "vi": "Quyền phê duyệt nhập xuất kho"}', true, now()),
('stock.movement.print', 'stock', 'movement', 'print', '{"en": "Print Stock Movements", "vi": "In nhập xuất kho"}', '{"en": "Permission to print stock movements", "vi": "Quyền in nhập xuất kho"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- Stock Inventory
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES 
('stock.inventory.view', 'stock', 'inventory', 'view', '{"en": "View Inventory", "vi": "Xem tồn kho"}', '{"en": "Permission to view inventory", "vi": "Quyền xem tồn kho"}', true, now()),
('stock.inventory.print', 'stock', 'inventory', 'print', '{"en": "Print Inventory", "vi": "In tồn kho"}', '{"en": "Permission to print inventory", "vi": "Quyền in tồn kho"}', true, now()),
('stock.inventory.export', 'stock', 'inventory', 'export', '{"en": "Export Inventory", "vi": "Xuất tồn kho"}', '{"en": "Permission to export inventory", "vi": "Quyền xuất tồn kho"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- ============================================
-- Report Module Permissions
-- ============================================

-- Reports
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES 
('report.report.view', 'report', 'report', 'view', '{"en": "View Reports", "vi": "Xem báo cáo"}', '{"en": "Permission to view reports", "vi": "Quyền xem báo cáo"}', true, now()),
('report.report.print', 'report', 'report', 'print', '{"en": "Print Reports", "vi": "In báo cáo"}', '{"en": "Permission to print reports", "vi": "Quyền in báo cáo"}', true, now()),
('report.report.export', 'report', 'report', 'export', '{"en": "Export Reports", "vi": "Xuất báo cáo"}', '{"en": "Permission to export reports", "vi": "Quyền xuất báo cáo"}', true, now())
ON CONFLICT ("key") DO NOTHING;

