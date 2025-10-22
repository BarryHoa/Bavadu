# Menu System - Simple Router-based

## Tổng quan

Hệ thống menu đơn giản dựa trên file `routers.json` trong mỗi module. Mỗi module chỉ cần định nghĩa một file `routers.json` để tạo menu.

## Cấu trúc

### 1. File routers.json

Mỗi module cần có file `modules/{module-name}/routers.json` với cấu trúc:

```json
{
  "name": "Module Name",
  "href": "/workspaces/modules/module-name",
  "icon": "IconName",
  "badge": "optional-badge",
  "children": [
    {
      "name": "Sub Menu",
      "href": "/workspaces/modules/module-name/sub",
      "icon": "SubIcon",
      "badge": "optional-badge",
      "children": [
        {
          "name": "Sub Sub Menu",
          "href": "/workspaces/modules/module-name/sub/sub",
          "icon": "SubSubIcon"
        }
      ]
    }
  ]
}
```

### 2. API Endpoint

- **GET** `/api/workspaces/menus` - Lấy tất cả menu từ các modules

### 3. Components

- **SimpleMenu** - Component hiển thị menu từ API
- **Menu** - Component menu chính (đã tích hợp SimpleMenu)

## Cách sử dụng

### 1. Tạo module mới

```bash
mkdir web/modules/your-module
touch web/modules/your-module/routers.json
```

### 2. Định nghĩa menu trong routers.json

```json
{
  "name": "Your Module",
  "href": "/workspaces/modules/your-module",
  "icon": "YourIcon",
  "children": [
    {
      "name": "Dashboard",
      "href": "/workspaces/modules/your-module",
      "icon": "BarChart3"
    },
    {
      "name": "Settings",
      "href": "/workspaces/modules/your-module/settings",
      "icon": "Settings"
    }
  ]
}
```

### 3. Menu tự động hiển thị

Menu sẽ tự động xuất hiện trong sidebar workspace khi API được gọi.

## Ví dụ

### HR Module (modules/hr/routers.json)

```json
{
  "name": "Human Resources",
  "href": "/workspaces/modules/hr",
  "icon": "Users",
  "badge": "156",
  "children": [
    {
      "name": "Dashboard",
      "href": "/workspaces/modules/hr",
      "icon": "BarChart3"
    },
    {
      "name": "Employee Management",
      "href": "/workspaces/modules/hr/employees",
      "icon": "Users",
      "badge": "156",
      "children": [
        {
          "name": "All Employees",
          "href": "/workspaces/modules/hr/employees",
          "icon": "Users"
        },
        {
          "name": "Add Employee",
          "href": "/workspaces/modules/hr/employees/new",
          "icon": "UserPlus"
        }
      ]
    }
  ]
}
```

### Analytics Module (modules/analytics/routers.json)

```json
{
  "name": "Analytics",
  "href": "/workspaces/modules/analytics",
  "icon": "BarChart3",
  "badge": "24",
  "children": [
    {
      "name": "Dashboard",
      "href": "/workspaces/modules/analytics",
      "icon": "BarChart3"
    },
    {
      "name": "Reports",
      "href": "/workspaces/modules/analytics/reports",
      "icon": "FileText",
      "children": [
        {
          "name": "Financial Reports",
          "href": "/workspaces/modules/analytics/reports/financial",
          "icon": "DollarSign"
        }
      ]
    }
  ]
}
```

## API Response

```json
{
  "success": true,
  "data": [
    {
      "name": "Human Resources",
      "href": "/workspaces/modules/hr",
      "icon": "Users",
      "badge": "156",
      "children": [...]
    },
    {
      "name": "Analytics",
      "href": "/workspaces/modules/analytics",
      "icon": "BarChart3",
      "badge": "24",
      "children": [...]
    }
  ],
  "message": "Loaded 2 module(s) menu"
}
```

## Tính năng

- ✅ **Auto-discovery**: Tự động tìm và load tất cả file routers.json
- ✅ **Hierarchical menu**: Hỗ trợ menu phân cấp nhiều cấp
- ✅ **Badge support**: Hiển thị badge cho menu items
- ✅ **Icon support**: Hỗ trợ icon (hiện tại là placeholder)
- ✅ **Server-side rendering**: Load menu từ server-side ngay khi init page
- ✅ **No client-side loading**: Menu được load sẵn, không cần fetch API
- ✅ **Error handling**: Xử lý lỗi khi không đọc được file
- ✅ **TypeScript support**: Đầy đủ type definitions

## Cấu trúc Files

```
web/
├── app/
│   └── api/
│       └── workspaces/
│           └── menus/
│               └── route.ts          # API endpoint
├── modules/
│   ├── hr/
│   │   └── routers.json             # HR module menu
│   └── analytics/
│       └── routers.json             # Analytics module menu
├── lib/
│   └── menu-loader.ts               # Menu loader utility
└── app/workspaces/
    ├── layout.tsx                   # Server-side layout
    ├── WorkspaceLayoutClient.tsx    # Client-side layout
    └── components/
        └── Menu.tsx                 # Unified menu component
```

## Lưu ý

- File `routers.json` phải là JSON hợp lệ
- Icon hiện tại được hiển thị dưới dạng placeholder (ký tự đầu tiên)
- Menu được load từ server-side ngay khi khởi tạo page (không cần fetch API)
- Hỗ trợ menu nested không giới hạn cấp độ
- Menu tự động refresh khi restart server (thay đổi file routers.json)
- **Serialization**: Tất cả data được serialize thành plain objects để truyền từ Server Component sang Client Component
- **Type Safety**: Đầy đủ TypeScript interfaces cho serialized data
- **Smart Navigation**:
  - Menu có children → Click để toggle expand/collapse
  - Menu không có children → Click để navigate (redirect)
