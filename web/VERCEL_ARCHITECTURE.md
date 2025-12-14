# Vercel Architecture - Custom Server Emulation

## Tổng quan

Ứng dụng được thiết kế để chạy trên cả **custom server** (server.ts) và **Vercel serverless**. Code đã được tinh chỉnh để emulate behavior của custom server trên Vercel.

## Kiến trúc so sánh

### Custom Server (server.ts)

```
┌─────────────────────────────────────────┐
│         HTTP Server (Node.js)            │
│  - Single process, long-running          │
│  - Global state shared                   │
│  - Cron scheduler running                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Initialization (Once)              │
│  - Database connection                  │
│  - Environment (models, menus)          │
│  - Cron scheduler start                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Request Handler                    │
│  - Update timestamp                     │
│  - Pass to Next.js handler              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Next.js Processing                 │
│  - Middleware (proxy.ts)                │
│  - API Routes / Pages                   │
└─────────────────────────────────────────┘
```

### Vercel Serverless

```
┌─────────────────────────────────────────┐
│      Vercel Edge/Serverless              │
│  - Multiple function instances           │
│  - Per-instance state (cached)         │
│  - No persistent processes              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Instrumentation Hook              │
│  - Runs per function instance           │
│  - Initialize runtime                   │
│  - Cache in globalThis                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Middleware (middleware.ts)         │
│  - Security (rate limit, CSRF, auth)    │
│  - Routing logic                        │
│  - Headers management                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      API Route / Page                   │
│  - Use cached runtime                   │
│  - Process request                      │
└─────────────────────────────────────────┘
```

## Components

### 1. Middleware (`middleware.ts`)

**Vị trí**: Root directory

**Vai trò**: Entry point cho tất cả requests trên Vercel

**Chức năng**:
- Import và export `proxy` function từ `proxy.ts`
- Define `config.matcher` để match routes
- Chạy trước mọi request (giống custom server HTTP handler)

**Code**:
```typescript
import { proxy } from "./proxy";
export { proxy as middleware };
```

### 2. Proxy (`proxy.ts`)

**Vị trí**: Root directory

**Vai trò**: Centralized security và routing handler

**Chức năng**:
- Rate limiting
- CSRF protection
- Authentication
- Routing logic
- Security headers

**Sử dụng bởi**:
- `middleware.ts` (Vercel)
- Custom server (có thể import nếu cần)

### 3. Instrumentation (`instrumentation.ts`)

**Vị trí**: Root directory

**Vai trò**: Initialize runtime khi serverless function start

**Chức năng**:
- Check nếu đang chạy custom server → skip
- Initialize database
- Initialize environment
- Setup global state
- Skip cron scheduler (Vercel dùng Vercel Cron)

**Logic**:
```typescript
if (RUNNING_CUSTOM_SERVER) → Skip
if (VERCEL || NODE_ENV === "production") → Initialize
```

### 4. Initialize Runtime (`initializeRuntime.ts`)

**Vị trí**: `module-base/server/utils/initializeRuntime.ts`

**Vai trò**: Shared utility để khởi tạo runtime

**Chức năng**:
- Check nếu đã initialized → skip (idempotent)
- Initialize logging → database → environment
- Set global state

**Sử dụng bởi**:
- `instrumentation.ts`
- Cron API routes
- Bất kỳ API route nào cần database/environment

### 5. API Routes

**Vị trí**: `app/api/`

**Vai trò**: Handle API requests

**Cấu trúc**:
- Generated từ `route.json` files
- Auto-export controllers
- Handle requests như custom server

## Request Flow

### Custom Server Flow

```
1. HTTP Request arrives
   ↓
2. server.ts receives request
   ↓
3. Update timestamp in globalThis
   ↓
4. Pass to Next.js handler
   ↓
5. Next.js middleware (proxy.ts) runs
   ↓
6. API Route or Page Route
   ↓
7. Response returned
```

### Vercel Flow

```
1. HTTP Request arrives at Vercel
   ↓
2. Function instance starts (if cold)
   ↓
3. Instrumentation runs (if cold)
   - Initialize runtime
   - Cache in globalThis
   ↓
4. Middleware (middleware.ts) runs
   - Security checks
   - Routing logic
   ↓
5. API Route or Page Route
   - Use cached runtime
   - Process request
   ↓
6. Response returned
```

## State Management

### Custom Server

```typescript
// Initialized once when server starts
globalThis.systemRuntimeVariables = {
  database: Database,      // Shared connection
  env: Environment,        // Shared environment
  timestamp: string        // Updated per request
}

// Lifetime: Entire server lifetime
// Scope: All requests share same state
```

### Vercel

```typescript
// Initialized per function instance (cached)
// Each serverless function instance has its own globalThis

// In instrumentation.ts or initializeRuntime()
if (!globalThis.systemRuntimeVariables) {
  await initializeRuntime()
  // Cached in this function instance
}

// Lifetime: Function instance lifetime
// Scope: Per function instance (not shared between instances)
```

**Lưu ý quan trọng**:
- Mỗi serverless function instance có `globalThis` riêng
- State không share giữa các instances (by design)
- Initialization được cache trong instance để tránh re-initialize

## Initialization Strategy

### Custom Server

**Timing**: Một lần khi server start

**Process**:
1. Start HTTP server
2. Initialize logging
3. Initialize database
4. Initialize environment
5. Start cron scheduler
6. Ready to handle requests

**State**: Persistent, shared across all requests

### Vercel

**Timing**: Per function instance (cached)

**Process**:
1. Function instance starts (cold start)
2. Instrumentation hook runs
3. Initialize runtime (if not cached)
4. Cache in globalThis
5. Ready to handle requests

**State**: Cached per instance, not shared between instances

## Cron Jobs

### Custom Server

```typescript
// node-cron scheduler
const scheduler = new ScheduledTask();
scheduler.start();
// Runs continuously in the same process
```

### Vercel

```typescript
// Vercel Cron Jobs
// Defined in vercel.json
{
  "crons": [
    {
      "path": "/api/cron/compress-logs",
      "schedule": "0 2 * * *"
    }
  ]
}
// Each cron job is a separate serverless function call
```

## Performance

### Cold Start

**Custom Server**: Không có (server chạy liên tục)

**Vercel**: 
- First request: ~1-3s (initialization)
- Subsequent requests: Fast (cached)

### Warm Start

**Custom Server**: Instant (state đã có sẵn)

**Vercel**: Fast (state cached trong instance)

### Optimization

1. **Connection Pooling**: Database connections được pool
2. **Lazy Initialization**: Chỉ initialize khi cần
3. **Caching**: Environment và database cached trong globalThis
4. **Pre-warming**: Có thể dùng Vercel Cron để keep functions warm

## Migration Path

### Development

```bash
# Custom server (local)
npm run server:start

# Next.js dev (simulate Vercel)
VERCEL=1 npm run dev
```

### Production

```bash
# Custom server (self-hosted)
npm run server:start

# Vercel (serverless)
vercel deploy
```

## Testing

### Test Custom Server

```bash
npm run server:start
# Server runs on http://localhost:3000
```

### Test Vercel Emulation

```bash
export VERCEL=1
export NEXT_RUNTIME=nodejs
export NODE_ENV=production
unset RUNNING_CUSTOM_SERVER

npm run dev
# Simulates Vercel environment
```

## Troubleshooting

### Middleware không chạy

**Check**:
- `middleware.ts` có export đúng không
- `config.matcher` match đúng routes
- Next.js version support middleware

**Fix**:
- Verify middleware.ts ở root directory
- Check Next.js version >= 12

### Initialization không chạy

**Check**:
- `NEXT_RUNTIME === "nodejs"`
- Không có `RUNNING_CUSTOM_SERVER`
- `VERCEL` hoặc `NODE_ENV === "production"`

**Fix**:
- Set environment variables đúng
- Check instrumentation.ts logic

### Global state không persist

**Expected**: Đây là expected behavior trong serverless

**Explanation**:
- Mỗi function instance có state riêng
- State chỉ persist trong lifetime của instance
- Không share state giữa instances

**Solution**:
- Sử dụng external storage (database, cache) nếu cần share state
- Design stateless APIs

## Best Practices

1. **Initialization**: Luôn sử dụng `initializeRuntime()` helper
2. **Error Handling**: Wrap initialization trong try-catch
3. **State Management**: Không rely on global state giữa requests
4. **Caching**: Cache expensive operations trong function instance
5. **Monitoring**: Monitor cold starts và execution times

## Kết luận

Code đã được tinh chỉnh để:
- ✅ Chạy trên custom server (server.ts)
- ✅ Chạy trên Vercel (serverless)
- ✅ Same routing logic (middleware)
- ✅ Same security (middleware)
- ✅ Same initialization (instrumentation)
- ✅ Same API structure (generated routes)

**Khác biệt chính**:
- State management (per instance vs shared)
- Cron jobs (Vercel Cron vs node-cron)
- Initialization timing (per instance vs once)

Code sẵn sàng cho cả hai environments!

