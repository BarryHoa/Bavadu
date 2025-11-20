# Middleware Usage Report

## Tổng Quan

Các middleware đã được tạo nhưng **chưa được sử dụng rộng rãi** trong codebase. Hầu hết chỉ được sử dụng trong một vài file.

## Chi Tiết Từng Middleware

### 1. `auth.ts` - Authentication Middleware ✅ ĐANG DÙNG

**Exports:**
- `withAuth()` - Main authentication middleware
- `getAuthenticatedUser()` - Helper function
- `isAuthenticated()` - Helper function
- `AuthenticatedRequest` - Type definition

**Đang được sử dụng tại:**
- ✅ `modules/product/server/controllers/products/create.ts` - Dùng `withAuth()`
- ✅ `module-base/server/controllers/auth/me.ts` - Dùng `withAuth()`
- ✅ `module-base/server/controllers/auth/logout.ts` - Dùng `withAuth()`

**Chưa được sử dụng tại:**
- ❌ `modules/product/server/controllers/products/get-by-id.ts`
- ❌ `modules/product/server/controllers/products/update.ts`
- ❌ `modules/product/server/controllers/categories/get-by-id.ts`
- ❌ Các route handlers khác

---

### 2. `authorization.ts` - Authorization Middleware ❌ CHƯA DÙNG

**Exports:**
- `withAuthorization()` - Authorization middleware
- `withAuthAndAuthz()` - Combined auth + authorization
- `getUserPermissions()` - Placeholder (cần implement)
- `getUserRoles()` - Placeholder (cần implement)
- `hasPermissions()` - Helper function
- `hasRoles()` - Helper function

**Đang được sử dụng tại:**
- ❌ **KHÔNG CÓ FILE NÀO SỬ DỤNG**

**Lý do:** 
- Cần implement `getUserPermissions()` và `getUserRoles()` trước
- Chưa có role/permission system trong database

---

### 3. `cors.ts` - CORS Middleware ❌ CHƯA DÙNG

**Exports:**
- `withCors()` - CORS middleware

**Đang được sử dụng tại:**
- ❌ **KHÔNG CÓ FILE NÀO SỬ DỤNG**

**Lý do:**
- Có thể cần configure trong `next.config.js` hoặc `proxy.ts` thay vì từng route

---

### 4. `csrf.ts` - CSRF Protection Middleware ❌ CHƯA DÙNG

**Exports:**
- `withCsrfProtection()` - CSRF protection middleware
- `setCsrfTokenCookie()` - Set CSRF token cookie
- `getCsrfTokenForClient()` - Get CSRF token for client

**Đang được sử dụng tại:**
- ❌ **KHÔNG CÓ FILE NÀO SỬ DỤNG**

**Lý do:**
- Cần apply cho các state-changing operations (POST, PUT, PATCH, DELETE)
- Cần generate token trong GET requests

---

### 5. `error-handler.ts` - Error Handling Middleware ❌ CHƯA DÙNG

**Exports:**
- `withErrorHandler()` - Error handling wrapper

**Đang được sử dụng tại:**
- ❌ **KHÔNG CÓ FILE NÀO SỬ DỤNG**

**Lý do:**
- Có thể wrap route handlers để catch errors
- Hiện tại các route handlers tự handle errors

---

### 6. `rate-limit.ts` - Rate Limiting Middleware ❌ CHƯA DÙNG

**Exports:**
- `withRateLimit()` - Rate limit middleware
- `applyRateLimit()` - Apply rate limit to handler
- `withUserRateLimit()` - User-specific rate limit

**Đang được sử dụng tại:**
- ❌ **KHÔNG CÓ FILE NÀO SỬ DỤNG**

**Lý do:**
- Cần apply cho authentication endpoints (login, register)
- Có thể apply cho tất cả API routes

---

### 7. `security-headers.ts` - Security Headers Middleware ❌ CHƯA DÙNG

**Exports:**
- `withSecurityHeaders()` - Security headers middleware

**Đang được sử dụng tại:**
- ❌ **KHÔNG CÓ FILE NÀO SỬ DỤNG**

**Lý do:**
- Đã được configure trong `next.config.js` (headers function)
- Có thể không cần middleware riêng nếu đã config trong Next.js config

---

## Tóm Tắt

| Middleware | Status | Sử dụng tại | Ghi chú |
|------------|--------|-------------|---------|
| `auth.ts` | ✅ Đang dùng | 3 files | Cần apply cho tất cả protected routes |
| `authorization.ts` | ❌ Chưa dùng | 0 files | Cần implement role/permission system |
| `cors.ts` | ❌ Chưa dùng | 0 files | Có thể config trong next.config.js |
| `csrf.ts` | ❌ Chưa dùng | 0 files | Cần apply cho state-changing operations |
| `error-handler.ts` | ❌ Chưa dùng | 0 files | Có thể wrap route handlers |
| `rate-limit.ts` | ❌ Chưa dùng | 0 files | Cần apply cho auth endpoints |
| `security-headers.ts` | ❌ Chưa dùng | 0 files | Đã config trong next.config.js |

## Khuyến Nghị

### Ưu tiên cao:
1. **Apply `withAuth()` cho tất cả protected routes**
   - `products/get-by-id.ts`
   - `products/update.ts`
   - `categories/get-by-id.ts`
   - Các route handlers khác

2. **Apply `withRateLimit()` cho authentication endpoints**
   - `auth/login.ts`
   - `auth/logout.ts`
   - Các endpoints nhạy cảm khác

3. **Apply `withCsrfProtection()` cho state-changing operations**
   - POST, PUT, PATCH, DELETE requests
   - Generate token trong GET requests

### Ưu tiên trung bình:
4. **Wrap route handlers với `withErrorHandler()`**
   - Để có error handling nhất quán
   - Sanitize errors trong production

5. **Implement và apply `withAuthorization()`**
   - Sau khi có role/permission system
   - Apply cho routes cần phân quyền

### Ưu tiên thấp:
6. **Review `withCors()` và `withSecurityHeaders()`**
   - Nếu đã config trong `next.config.js` thì có thể không cần middleware
   - Hoặc dùng middleware để có control tốt hơn

## Ví Dụ Sử Dụng

### Ví dụ 1: Apply authentication
```typescript
// modules/product/server/controllers/products/get-by-id.ts
import { withAuth } from "@/module-base/server/middleware/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request, { required: true });
  if (!authResult.authenticated) {
    return authResult.response;
  }
  // ... rest of handler
}
```

### Ví dụ 2: Apply rate limiting
```typescript
// module-base/server/controllers/auth/login.ts
import { withRateLimit } from "@/module-base/server/middleware/rate-limit";

export async function POST(request: NextRequest) {
  const rateLimitCheck = await withRateLimit({
    max: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  })(request);
  
  if (rateLimitCheck) {
    return rateLimitCheck; // Rate limit exceeded
  }
  
  // ... rest of login handler
}
```

### Ví dụ 3: Apply CSRF protection
```typescript
// modules/product/server/controllers/products/create.ts
import { withCsrfProtection, setCsrfTokenCookie } from "@/module-base/server/middleware/csrf";

export async function POST(request: NextRequest) {
  // Check CSRF token
  const csrfCheck = await withCsrfProtection(async (req) => {
    // ... handler logic
  })(request);
  
  // Set CSRF token in response
  const response = await csrfCheck;
  return setCsrfTokenCookie(response);
}
```

### Ví dụ 4: Wrap với error handler
```typescript
import { withErrorHandler } from "@/module-base/server/middleware/error-handler";

export const POST = withErrorHandler(async (request: NextRequest) => {
  // ... handler logic
  // Errors will be automatically caught and sanitized
});
```

