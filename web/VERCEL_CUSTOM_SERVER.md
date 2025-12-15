# Vercel Custom Server Emulation

Tài liệu về cách chạy ứng dụng trên Vercel như một custom server.

## Tổng quan

Vercel không hỗ trợ custom server trực tiếp, nhưng chúng ta có thể **emulate** behavior của custom server bằng cách:

1. **Middleware**: Sử dụng Next.js middleware để handle routing và security (giống custom server)
2. **Instrumentation**: Khởi tạo runtime (database, environment) khi serverless function start
3. **API Routes**: Sử dụng Next.js API routes thay vì custom HTTP server
4. **Runtime Context**: Quản lý state qua `RuntimeContext` singleton per process/instance

## Kiến trúc

### Custom Server (server.ts)

```
HTTP Server → Next.js Handler → Request Processing
  ↓
Initialize once: Database, Environment, Cron
  ↓
Global state shared across all requests
```

### Vercel Emulation

```
Request → Middleware (proxy.ts) → API Route/Page
  ↓
Instrumentation: Initialize per function instance
  ↓
Global state per function instance (cached)
```

## So sánh

| Aspect               | Custom Server                 | Vercel Emulation                 |
| -------------------- | ----------------------------- | -------------------------------- |
| **Initialization**   | Một lần khi server start      | Mỗi serverless function instance |
| **State Sharing**    | Global across all requests    | Per function instance (cached)   |
| **Routing**          | HTTP server + Next.js handler | Next.js middleware + API routes  |
| **Cron Jobs**        | node-cron scheduler           | Vercel Cron Jobs                 |
| **Request Handling** | HTTP server → Next.js handler | Middleware → API route           |

## Components

### 1. Middleware (`middleware.ts`)

**Vai trò**: Thay thế HTTP server request handling

**Chức năng**:

- Handle routing (giống custom server)
- Security (rate limiting, CSRF, authentication)
- Headers management

**File**: `middleware.ts` → imports `proxy.ts`

### 2. Instrumentation (`instrumentation.ts`)

**Vai trò**: Khởi tạo runtime khi serverless function start

**Chức năng**:

- Initialize database
- Initialize environment
- Setup global state
- Skip nếu đang chạy custom server

**Logic**:

```typescript
if (RUNNING_CUSTOM_SERVER) → Skip
if (VERCEL || NODE_ENV === "production") → Initialize
```

### 3. Initialize Runtime (`initializeRuntime.ts`)

**Vai trò**: Shared utility để khởi tạo runtime

**Chức năng**:

- Check nếu đã initialized → skip
- Initialize logging → database → environment
- Set global state

**Sử dụng bởi**:

- `instrumentation.ts`
- Cron API routes
- Bất kỳ API route nào cần database/environment

### 4. API Routes

**Vai trò**: Thay thế custom server route handlers

**Cấu trúc**:

- Generated từ `route.json` files
- Tự động export controllers
- Handle requests như custom server

## Request Flow

### Custom Server Flow

```
1. HTTP Request → server.ts
2. Update timestamp in globalThis
3. Pass to Next.js handler
4. Next.js processes request
5. Response returned
```

### Vercel Flow

```
1. HTTP Request → Vercel Edge/Serverless
2. Middleware (middleware.ts) runs
   - Security checks
   - Routing logic
3. API Route or Page Route
   - Initialize runtime if needed
   - Process request
4. Response returned
```

## Runtime Context Management

### Custom Server

```typescript
// Initialized once
await RuntimeContext.getInstance().ensureInitialized();

// Updated per request if needed
RuntimeContext.getInstance().updateTimestamp();
```

### Vercel

```typescript
// Initialized per function instance (cached inside the instance)
await RuntimeContext.getInstance().ensureInitialized();
```

**Lưu ý**:

- Mỗi serverless function instance có context riêng
- Initialization được cache trong instance
- Không share state giữa các instances (by design của serverless)

## Initialization Strategy

### Custom Server

- Initialize một lần khi server start
- State tồn tại suốt lifetime của server
- Cron scheduler chạy liên tục

### Vercel

- Initialize khi function instance start (cached)
- State tồn tại trong lifetime của function instance
- Cron jobs chạy qua Vercel Cron (không phải node-cron)

## Migration Checklist

### ✅ Đã hoàn thành

- [x] Tạo `middleware.ts` để handle routing
- [x] Tạo `instrumentation.ts` để initialize runtime
- [x] Tạo `initializeRuntime()` helper
- [x] Update cron routes để sử dụng helper
- [x] Skip instrumentation khi chạy custom server
- [x] Setup Vercel Cron Jobs

### 🔄 Cần kiểm tra

- [ ] Test middleware hoạt động đúng trên Vercel
- [ ] Verify global state được cache đúng
- [ ] Test API routes hoạt động như custom server
- [ ] Verify cron jobs chạy đúng schedule
- [ ] Monitor performance và cold start times

## Performance Considerations

### Cold Start

- **Custom Server**: Không có cold start (server chạy liên tục)
- **Vercel**: Có cold start khi function instance mới
  - Initialization time: ~1-3s (database, environment)
  - Cached sau lần đầu

### Warm Start

- **Custom Server**: Instant (state đã có sẵn)
- **Vercel**: Fast (state cached trong instance)

### Optimization Tips

1. **Pre-warm functions**: Sử dụng Vercel Cron để keep functions warm
2. **Connection pooling**: Database connections được pool và reuse
3. **Lazy initialization**: Chỉ initialize khi cần
4. **Cache environment**: Environment được cache trong globalThis

## Testing

### Test Local với Vercel Environment

```bash
# Simulate Vercel environment
export VERCEL=1
export NEXT_RUNTIME=nodejs
export NODE_ENV=production
unset RUNNING_CUSTOM_SERVER

# Run Next.js (will use instrumentation)
npm run dev
```

### Test Custom Server

```bash
# Run custom server (will skip instrumentation)
npm run server:start
```

### Test Middleware

```bash
# Test middleware locally
npm run dev
# Make requests and check middleware logs
```

## Troubleshooting

### Middleware không chạy

- Check `middleware.ts` có export đúng không
- Verify `config.matcher` match đúng routes
- Check Next.js version support middleware

### Initialization không chạy

- Check `NEXT_RUNTIME === "nodejs"`
- Verify không có `RUNNING_CUSTOM_SERVER`
- Check `VERCEL` hoặc `NODE_ENV === "production"`
- Xem logs để debug

### Global state không persist

- Đây là expected behavior trong serverless
- Mỗi function instance có state riêng
- State chỉ persist trong lifetime của instance
- Sử dụng external storage (database, cache) nếu cần share state

### Performance issues

- Check cold start times
- Optimize initialization (lazy load, cache)
- Consider connection pooling
- Monitor function execution times

## Best Practices

1. **Initialization**: Sử dụng `initializeRuntime()` helper để tránh duplicate
2. **Error Handling**: Wrap initialization trong try-catch
3. **State Management**: Không rely on global state giữa các requests
4. **Caching**: Cache expensive operations trong function instance
5. **Monitoring**: Monitor cold starts và execution times

## Kết luận

Vercel emulation cho phép chạy ứng dụng như custom server với:

- ✅ Same routing logic (middleware)
- ✅ Same security (middleware)
- ✅ Same initialization (instrumentation)
- ✅ Same API structure (generated routes)
- ⚠️ Different state management (per instance)
- ⚠️ Different cron jobs (Vercel Cron)

Code đã được tinh chỉnh để hoạt động tốt trên cả custom server và Vercel.
