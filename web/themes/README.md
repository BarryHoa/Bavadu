# Themes

Thư mục này chứa các theme của ứng dụng với cấu trúc modular.

## Cấu trúc

```
themes/
├── types.ts          # Interface chung cho theme
├── light.ts          # Theme sáng
├── dark.ts           # Theme tối
├── index.ts          # Export và utilities
└── README.md         # Tài liệu này
```

## Sử dụng

### Import theme

```typescript
import { lightTheme, darkTheme, Theme } from "@/themes";
```

### Import types

```typescript
import { ThemeMode, ThemeColors } from "@/themes";
```

### Lazy load theme

```typescript
import { getTheme, getAvailableThemes } from "@/themes";

const theme = await getTheme("dark");
const availableThemes = getAvailableThemes();
```

## Thêm theme mới

1. Tạo file theme mới (ví dụ: `blue.ts`)
2. Implement interface `Theme` từ `types.ts`
3. Export theme trong `index.ts`
4. Thêm vào `themes` registry

## Interface Theme

Mỗi theme phải implement interface `Theme` với các thuộc tính:

- `colors`: Bộ màu sắc (primary, secondary, success, error, warning, neutral)
- `spacing`: Khoảng cách
- `borderRadius`: Bo góc
- `fontSize`: Kích thước font
- `fontWeight`: Độ đậm font
- `boxShadow`: Đổ bóng
