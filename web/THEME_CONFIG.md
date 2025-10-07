# HeroUI Light Theme Configuration

## Tổng quan

Dự án này đã được cấu hình với một theme light mode tùy chỉnh cho HeroUI, dựa trên tài liệu chính thức từ [HeroUI Theme Documentation](https://www.heroui.com/docs/customization/theme).

## Cấu hình Theme

### 1. Tailwind Configuration

File `tailwind.config.js` đã được cập nhật với cấu hình theme tùy chỉnh:

```javascript
plugins: [
  heroui({
    prefix: "heroui",
    addCommonColors: true,
    defaultTheme: "light",
    defaultExtendTheme: "light",
    layout: {
      disabledOpacity: 0.3,
      radius: {
        small: "4px",
        medium: "6px", 
        large: "8px",
      },
      borderWidth: {
        small: "1px",
        medium: "2px",
        large: "3px",
      },
    },
    themes: {
      light: {
        colors: {
          // Cấu hình màu sắc tùy chỉnh...
        }
      }
    }
  })
]
```

### 2. Màu sắc được cấu hình

#### Màu cơ bản:
- **Background**: `#FFFFFF` - Nền trắng sạch
- **Foreground**: `#11181C` - Văn bản tối
- **Content**: Các lớp content từ 1-4 với độ sáng khác nhau

#### Màu chức năng:
- **Primary**: Xanh dương (#006FEE) - Màu chính
- **Secondary**: Xám (#808087) - Màu phụ
- **Success**: Xanh lá (#17C964) - Thành công
- **Warning**: Cam (#F5A524) - Cảnh báo  
- **Danger**: Đỏ (#F31260) - Lỗi

### 3. Layout Configuration

- **Border Radius**: 4px (small), 6px (medium), 8px (large)
- **Border Width**: 1px (small), 2px (medium), 3px (large)
- **Disabled Opacity**: 0.3

## Cách sử dụng

### 1. Áp dụng theme mặc định

Theme light đã được set làm mặc định trong `app/layout.tsx`:

```tsx
<Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
```

### 2. Sử dụng các màu sắc

```tsx
// Background colors
<div className="bg-background">Nền chính</div>
<div className="bg-content1">Nền content 1</div>
<div className="bg-content2">Nền content 2</div>

// Text colors  
<p className="text-foreground">Văn bản chính</p>
<p className="text-default-600">Văn bản phụ</p>

// Component colors
<Button color="primary">Primary Button</Button>
<Button color="secondary">Secondary Button</Button>
<Chip color="success">Success Chip</Chip>
```

### 3. Demo Components

File `components/theme-demo.tsx` chứa các ví dụ về cách sử dụng theme với các component HeroUI:

- Buttons với các màu sắc khác nhau
- Chips với các variant khác nhau
- Progress bars với màu sắc tùy chỉnh
- Badges và Cards
- Layout demo với content colors

## Tùy chỉnh thêm

### Thêm màu sắc mới

Để thêm màu sắc mới, cập nhật trong `tailwind.config.js`:

```javascript
themes: {
  light: {
    colors: {
      // Thêm màu mới
      custom: {
        50: "#F0F9FF",
        100: "#E0F2FE", 
        500: "#0EA5E9",
        900: "#0C4A6E",
        DEFAULT: "#0EA5E9",
        foreground: "#FFFFFF"
      }
    }
  }
}
```

### Thêm theme mới

```javascript
themes: {
  light: { /* light theme config */ },
  custom: { /* custom theme config */ }
}
```

## Chạy dự án

```bash
cd web
npm run dev
```

Truy cập `http://localhost:3000` để xem theme demo.

## Tài liệu tham khảo

- [HeroUI Theme Documentation](https://www.heroui.com/docs/customization/theme)
- [HeroUI Components](https://www.heroui.com/docs/components)
- [Tailwind CSS](https://tailwindcss.com/docs)
