# Vercel Cron Jobs Setup

Hướng dẫn thiết lập và chạy cron jobs trên Vercel.

## Tổng quan

Vercel không hỗ trợ persistent Node.js processes, nên không thể chạy `node-cron` như trên server thông thường. Thay vào đó, Vercel cung cấp **Vercel Cron Jobs** để chạy scheduled tasks.

## Cấu trúc

### 1. API Routes

Các cron jobs được định nghĩa như API routes trong `app/api/cron/`:

- **`/api/cron/compress-logs`**: Nén log files (chạy hàng ngày lúc 2:00 AM)
- **`/api/cron/cleanup-expired-sessions`**: Xóa expired sessions (chạy hàng ngày lúc 3:00 AM)

### 2. Vercel Configuration

Cron jobs được cấu hình trong `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/compress-logs",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/cleanup-expired-sessions",
      "schedule": "0 3 * * *"
    }
  ]
}
```

### 3. Cron Schedule Format

Vercel sử dụng cron expression với 5 fields (UTC timezone):

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

**Ví dụ:**
- `0 2 * * *` - Mỗi ngày lúc 2:00 AM UTC
- `0 */6 * * *` - Mỗi 6 giờ
- `*/15 * * * *` - Mỗi 15 phút
- `0 0 1 * *` - Ngày đầu tiên của mỗi tháng lúc 0:00 AM UTC

## Setup trên Vercel

### Bước 1: Deploy code lên Vercel

Code đã được cấu hình sẵn, chỉ cần deploy:

```bash
vercel deploy
```

### Bước 2: Cấu hình Environment Variables (Tùy chọn)

Để bảo mật, bạn có thể set `CRON_SECRET` trong Vercel Dashboard:

1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Thêm biến:
   - **Name**: `CRON_SECRET`
   - **Value**: Một secret string ngẫu nhiên (ví dụ: `your-super-secret-cron-key-here`)
   - **Environment**: Production (và Preview nếu cần)

### Bước 3: Verify Cron Jobs

Sau khi deploy, Vercel sẽ tự động:
1. Đọc `vercel.json` và tạo cron jobs
2. Gọi các API routes theo schedule đã định

Bạn có thể kiểm tra:
- Vercel Dashboard → Project → Cron Jobs
- Xem logs trong Vercel Dashboard → Project → Logs

## Testing Cron Jobs

### Test thủ công

Bạn có thể test các cron endpoints bằng cách gọi trực tiếp:

```bash
# Test compress-logs
curl https://your-domain.vercel.app/api/cron/compress-logs \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test cleanup-expired-sessions
curl https://your-domain.vercel.app/api/cron/cleanup-expired-sessions \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Test local

Để test local, bạn có thể chạy:

```bash
# Start dev server
npm run dev

# Test endpoint
curl http://localhost:3000/api/cron/compress-logs
```

## Lưu ý quan trọng

### 1. Timezone

- Vercel Cron Jobs chạy theo **UTC timezone**
- Nếu bạn muốn chạy theo timezone khác (ví dụ: Asia/Ho_Chi_Minh), cần convert:
  - Asia/Ho_Chi_Minh = UTC+7
  - 2:00 AM VN = 19:00 PM UTC (ngày hôm trước)
  - 3:00 AM VN = 20:00 PM UTC (ngày hôm trước)

**Ví dụ:** Để chạy lúc 2:00 AM giờ Việt Nam:
```json
{
  "path": "/api/cron/compress-logs",
  "schedule": "0 19 * * *"  // 19:00 UTC = 2:00 AM VN (next day)
}
```

### 2. Database Initialization

Các cron API routes sẽ tự động khởi tạo database nếu chưa được khởi tạo. Điều này đảm bảo:
- Database connection được tạo khi function start
- Có thể truy cập database trong cron job

### 3. Function Timeout

- Vercel Hobby plan: 10 giây timeout
- Vercel Pro plan: 60 giây timeout
- Vercel Enterprise: Có thể config custom timeout

Nếu cron job chạy lâu hơn timeout, sẽ bị kill. Cần optimize hoặc split thành nhiều jobs nhỏ hơn.

### 4. Error Handling

Các cron jobs đã có error handling:
- Log errors ra console
- Return JSON response với success/error status
- Không throw error để tránh crash function

### 5. Security

- Vercel tự động thêm header `x-vercel-signature` khi gọi cron jobs
- Nếu set `CRON_SECRET`, cần Authorization header với format: `Bearer {CRON_SECRET}`
- Khuyến nghị: Set `CRON_SECRET` trong production để bảo mật tốt hơn

## Thêm Cron Job mới

Để thêm cron job mới:

1. **Tạo API route** trong `app/api/cron/{job-name}/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Your cron job logic here
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

2. **Thêm vào `vercel.json`**:

```json
{
  "crons": [
    {
      "path": "/api/cron/{job-name}",
      "schedule": "0 * * * *"  // Your schedule
    }
  ]
}
```

3. **Deploy lại** để Vercel nhận cấu hình mới

## Monitoring

Bạn có thể monitor cron jobs qua:
- **Vercel Dashboard**: Xem logs và execution history
- **API Response**: Mỗi cron job return JSON với status và results
- **Console Logs**: Check Vercel function logs để debug

## Troubleshooting

### Cron job không chạy

1. Kiểm tra `vercel.json` có đúng format không
2. Verify cron schedule expression đúng syntax
3. Check Vercel Dashboard → Cron Jobs để xem có được tạo không
4. Xem logs để tìm lỗi

### Cron job bị timeout

1. Optimize code để chạy nhanh hơn
2. Split job thành nhiều jobs nhỏ hơn
3. Upgrade Vercel plan để có timeout lớn hơn

### Database connection errors

1. Đảm bảo database credentials đúng trong Vercel environment variables
2. Check database connection pooling settings
3. Verify database cho phép connections từ Vercel IPs

## Tài liệu tham khảo

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Cron Expression Syntax](https://crontab.guru/)

