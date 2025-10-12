# Navigation Loader

Component hiển thị loading indicator khi chuyển trang trong Next.js App Router.

## Features

- 🎨 **3 Loading Styles**: Bar, Overlay, hoặc Both
- ⚡ **Smooth Animations**: Sử dụng Framer Motion
- 🎯 **Auto Detection**: Tự động detect route changes
- ⏱️ **Minimum Loading Time**: Tránh flash của loading indicator
- 🎨 **Theme-aware**: Tự động adapt với light/dark theme

## Usage

### 1. Basic Usage (Loading Bar)

Đã được tích hợp sẵn trong `app/providers.tsx`:

```tsx
<NavigationLoader style="bar" minLoadingTime={300} />
```

### 2. Custom Styles

```tsx
// Chỉ hiển thị Loading Bar (mặc định)
<NavigationLoader style="bar" />

// Chỉ hiển thị Loading Overlay
<NavigationLoader style="overlay" />

// Hiển thị cả Bar và Overlay
<NavigationLoader style="both" />
```

### 3. Custom Loading Time

```tsx
// Loading tối thiểu 500ms
<NavigationLoader style="bar" minLoadingTime={500} />

// Loading tối thiểu 200ms (nhanh hơn)
<NavigationLoader style="bar" minLoadingTime={200} />
```

## Props

| Prop             | Type                           | Default | Description                      |
| ---------------- | ------------------------------ | ------- | -------------------------------- |
| `style`          | `"bar" \| "overlay" \| "both"` | `"bar"` | Kiểu hiển thị loading            |
| `minLoadingTime` | `number`                       | `300`   | Thời gian loading tối thiểu (ms) |

## Components

### LoadingBar

Thanh loading gradient ở top của page với animation mượt mà.

### LoadingOverlay

Full-screen overlay với spinner animation ở giữa màn hình.

### NavigationLoader

Component wrapper tự động detect route changes và hiển thị loading.

## Customization

### Thay đổi màu sắc Loading Bar

Edit file `web/components/base/LoadingBar.tsx`:

```tsx
// Thay đổi gradient color
className =
  "fixed top-0 left-0 right-0 z-[9999] h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500";

// Ví dụ: đổi sang green theme
className =
  "fixed top-0 left-0 right-0 z-[9999] h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500";
```

### Thay đổi style Loading Overlay

Edit file `web/components/base/LoadingOverlay.tsx`:

```tsx
// Thay đổi spinner color
className = "absolute inset-0 rounded-full border-4 border-t-primary";
```

## Examples

### Sử dụng với Next.js Link

```tsx
import Link from "next/link";

export default function MyComponent() {
  return <Link href="/dashboard">Go to Dashboard</Link>;
}
```

Loading sẽ tự động hiển thị khi click vào link.

### Sử dụng với useRouter

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function MyComponent() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push("/dashboard");
  };

  return <button onClick={handleNavigate}>Go to Dashboard</button>;
}
```

Loading sẽ tự động hiển thị khi gọi `router.push()`.

## Performance

- Loading bar chỉ render khi có navigation
- Sử dụng `Suspense` để tránh hydration issues
- Minimum loading time để tránh flash
- Animation được optimize với Framer Motion

## Browser Support

✅ Chrome, Edge, Firefox, Safari (latest versions)
✅ Mobile browsers
✅ Supports SSR and SSG

## Notes

- Component này chỉ hoạt động trong Next.js App Router (Next.js 13+)
- Đã được tích hợp vào `app/providers.tsx` và sẽ hoạt động toàn bộ app
- Không cần configuration thêm, chỉ cần thay đổi props nếu muốn customize
