# Bava Web Module System

Hệ thống module cho Bava Web application cho phép tạo, cài đặt và quản lý các module độc lập.

## Cấu trúc Module

```
web/
├── modules/                    # Thư mục chứa tất cả modules
│   ├── module.json            # Registry của tất cả modules
│   └── module_name/           # Module directory
│       ├── module.json        # Module configuration
│       ├── app/               # Next.js app routes
│       ├── components/        # Module components
│       ├── lib/               # Module utilities
│       └── types/             # Module types
├── app/                       # Auto-generated app routes
│   └── module_name/           # Generated from modules
├── scripts/
│   └── module-manager.js      # CLI tool for module management
└── lib/
    └── module-loader.ts       # Module loader utilities
```

## Module Management Commands

### Install Module

```bash
npm run module:install hr
```

### Uninstall Module

```bash
npm run module:uninstall hr
```

### List Installed Modules

```bash
npm run module:list
```

### Create New Module

```bash
npm run module:create my_module "My Module Description"
```

## Module Configuration

Mỗi module cần có file `module.json`:

```json
{
  "name": "module_name",
  "version": "1.0.0",
  "description": "Module description",
  "author": "Author name",
  "routes": [
    {
      "path": "/module_name",
      "component": "page.tsx"
    }
  ],
  "dependencies": [],
  "autoGenerate": true
}
```

## Module Development

### 1. Tạo Module Structure

```bash
npm run module:create my_module
```

### 2. Phát triển Module

- Tạo components trong `modules/my_module/components/`
- Tạo pages trong `modules/my_module/app/`
- Tạo utilities trong `modules/my_module/lib/`
- Tạo types trong `modules/my_module/types/`

### 3. Install Module

```bash
npm run module:install my_module
```

### 4. Access Module

Module sẽ được tự động generate vào `app/my_module/` và có thể truy cập qua URL `/my_module`

## HR Module Demo

Module HR đã được tạo sẵn với các tính năng:

- **Dashboard**: Tổng quan HR với stats và quick actions
- **Employees**: Quản lý danh sách nhân viên
- **Employee Detail**: Chi tiết thông tin nhân viên
- **Attendance**: Quản lý chấm công
- **Payroll**: Quản lý lương

### Install HR Module

```bash
npm run module:install hr
```

### Access HR Module

- Dashboard: `/hr`
- Employees: `/hr/employees`
- Employee Detail: `/hr/employees/[id]`
- Attendance: `/hr/attendance`
- Payroll: `/hr/payroll`

## Module System Features

### Auto-Generation

- Tự động copy module app routes vào main app directory
- Tự động tạo symlinks cho components và utilities
- Tự động update module registry

### Module Registry

- Theo dõi tất cả modules đã cài đặt
- Quản lý dependencies giữa các modules
- Version control cho modules

### CLI Management

- Install/uninstall modules
- List installed modules
- Create new modules
- Module dependency management

## Best Practices

1. **Module Isolation**: Mỗi module nên độc lập và không phụ thuộc vào modules khác
2. **Naming Convention**: Sử dụng snake_case cho module names
3. **Component Organization**: Tổ chức components theo feature
4. **Type Safety**: Sử dụng TypeScript cho tất cả modules
5. **Documentation**: Mỗi module nên có README riêng

## Troubleshooting

### Module không install được

- Kiểm tra file `module.json` có đúng format
- Kiểm tra quyền ghi trong thư mục modules
- Kiểm tra dependencies

### Module không hiển thị

- Chạy `npm run module:list` để kiểm tra module đã install
- Kiểm tra autoGenerate setting trong module.json
- Restart development server

### Module conflicts

- Kiểm tra route paths không trùng lặp
- Kiểm tra component names không trùng lặp
- Sử dụng unique prefixes cho module components
