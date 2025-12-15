# Vercel Environment Fixes

Tài liệu về các fixes và improvements cho Vercel/serverless environment.

## Các thay đổi chính

### 1. Helper Function: `initializeRuntime()`

Tạo utility function `module-base/server/utils/initializeRuntime.ts` để:

- Tránh duplicate code giữa `instrumentation.ts` và cron API routes
- Đảm bảo initialization đúng thứ tự: logging → database → environment
- Tự động check nếu đã initialized để tránh double initialization

**Sử dụng:**

```typescript
import { initializeRuntime } from "@base/server/utils/initializeRuntime";
await initializeRuntime();
```

### 2. Cải thiện Cron API Routes

**Trước:**

- Mỗi cron route tự khởi tạo database và environment
- Code duplicate giữa các routes

**Sau:**

- Sử dụng `initializeRuntime()` helper
- Code ngắn gọn, dễ maintain
- Đảm bảo consistency

**Files đã cập nhật:**

- `app/api/cron/cleanup-expired-sessions/route.ts`
- `app/api/cron/compress-logs/route.ts`

### 3. Cải thiện Instrumentation

**Trước:**

- Code dài, khó maintain
- Duplicate logic với cron routes

**Sau:**

- Sử dụng `initializeRuntime()` helper
- Code ngắn gọn hơn
- Dễ debug và maintain

### 4. Logic Skip Instrumentation

**Khi nào skip:**

1. `RUNNING_CUSTOM_SERVER === "true"` → Custom server tự khởi tạo
2. Không phải Vercel + không phải production + không có `FORCE_INSTRUMENTATION` → Local dev với custom server

**Khi nào chạy:**

1. `VERCEL === "1"` → Vercel environment
2. `NODE_ENV === "production"` → Production environment
3. `FORCE_INSTRUMENTATION === "1"` → Force chạy (cho testing)

## Testing

### Test Local với Vercel Environment

```bash
# Set Vercel environment variables
export VERCEL=1
export NEXT_RUNTIME=nodejs
export NODE_ENV=production
unset RUNNING_CUSTOM_SERVER

# Run Next.js
npm run dev
```

### Test Cron Routes

```bash
# Test cleanup-expired-sessions
curl http://localhost:3000/api/cron/cleanup-expired-sessions \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test compress-logs
curl http://localhost:3000/api/cron/compress-logs \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Test với Custom Server

```bash
# Custom server sẽ skip instrumentation
npm run server:start
```

## Các bugs đã fix

### 1. Double Initialization

- **Vấn đề:** Cron routes và instrumentation đều khởi tạo database/environment
- **Fix:** Sử dụng `initializeRuntime()` với check `if already initialized`

### 2. Missing Environment

- **Vấn đề:** Cron routes chỉ khởi tạo database, không có environment
- **Fix:** `initializeRuntime()` khởi tạo cả database và environment

### 3. Inconsistent Initialization Order

- **Vấn đề:** Thứ tự khởi tạo khác nhau giữa các files
- **Fix:** Standardized order: logging → database → environment

### 4. Code Duplication

- **Vấn đề:** Duplicate code giữa instrumentation và cron routes
- **Fix:** Extract vào `initializeRuntime()` helper

## Best Practices

### 1. Sử dụng `initializeRuntime()` trong API Routes

Nếu API route cần database/environment:

```typescript
import { initializeRuntime } from "@base/server/utils/initializeRuntime";

export async function GET(request: NextRequest) {
  await initializeRuntime();
  // Your code here
}
```

### 2. Error Handling

`initializeRuntime()` có thể throw errors. Nên wrap trong try-catch:

```typescript
try {
  await initializeRuntime();
} catch (error) {
  console.error("Failed to initialize runtime:", error);
  // Handle error appropriately
}
```

## Deployment Checklist

- [ ] Set `CRON_SECRET` trong Vercel environment variables
- [ ] Verify `vercel.json` có cron jobs configuration
- [ ] Test cron jobs sau khi deploy
- [ ] Monitor logs trong Vercel Dashboard
- [ ] Verify database connections work trong serverless environment

## Troubleshooting

### Cron job không chạy

1. Check `vercel.json` có đúng cron configuration
2. Verify cron schedule expression đúng syntax
3. Check Vercel Dashboard → Cron Jobs
4. Xem logs để tìm lỗi

### Database connection errors

1. Verify database credentials trong Vercel environment variables
2. Check database cho phép connections từ Vercel IPs
3. Verify `initializeRuntime()` được gọi trước khi dùng database

### Instrumentation không chạy

1. Check `NEXT_RUNTIME === "nodejs"`
2. Verify không có `RUNNING_CUSTOM_SERVER === "true"`
3. Check `VERCEL` hoặc `NODE_ENV === "production"`
4. Xem logs để debug
