# Cron Scheduler

Cron scheduler tương tự như Laravel's Task Scheduler, sử dụng `node-cron` để định nghĩa và chạy các scheduled tasks.

## Cấu trúc

```
cron/
├── Kernel.ts         # Base class định nghĩa schedule (giống Laravel's Kernel.php)
├── ScheduledTask.ts  # Class extends Kernel, định nghĩa các tasks cụ thể
├── index.ts          # Exports
└── README.md         # Documentation
```

## Cách sử dụng

### 1. Định nghĩa tasks trong `ScheduledTask.ts`

Mở file `cron/ScheduledTask.ts` và thêm tasks vào method `schedule()`:

```typescript
import { Kernel } from "./Kernel";

export class ScheduledTask extends Kernel {
  protected schedule(): void {
    // Cleanup expired sessions daily at 3:00 AM
    this.dailyAt("cleanup-expired-sessions", "03:00", async () => {
      const sessionModel = new SessionModel();
      await sessionModel.cleanupExpiredSessions();
    });

    // Chạy mỗi giờ
    this.hourly("hourly-task", () => {
      console.log("Running hourly task");
    });

    // Chạy mỗi 30 phút
    this.everyMinutes(30, "every-30-minutes", () => {
      console.log("Running every 30 minutes");
    });
  }
}
```

### 2. Các methods có sẵn

**Lưu ý:** Tất cả các methods đều yêu cầu `name` là tham số đầu tiên (sau các tham số số như minutes/hours) để đảm bảo mỗi task có tên duy nhất.

#### `dailyAt(name, time, task)`

Chạy mỗi ngày vào giờ cụ thể:

```typescript
this.dailyAt("task-name", "14:30", async () => {
  // Task code
});
```

#### `daily(name, task, time?)`

Chạy mỗi ngày (mặc định 00:00):

```typescript
this.daily(
  "task-name",
  async () => {
    // Task code
  },
  "02:00" // Optional time
);
```

#### `hourly(name, task, minute?)`

Chạy mỗi giờ:

```typescript
this.hourly(
  "task-name",
  async () => {
    // Task code
  },
  30 // Optional minute (0-59)
);
```

#### `everyMinutes(minutes, name, task)`

Chạy mỗi N phút:

```typescript
this.everyMinutes(15, "task-name", async () => {
  // Task code
});
```

#### `everyHours(hours, name, task, minute?)`

Chạy mỗi N giờ:

```typescript
this.everyHours(
  6,
  "task-name",
  async () => {
    // Task code
  },
  0 // Optional minute
);
```

#### `everySeconds(seconds, name, task)`

Chạy mỗi N giây (1-59):

```typescript
this.everySeconds(30, "task-name", async () => {
  // Task code
});
```

#### `cron(expression, name, task)`

Custom cron expression:

```typescript
this.cron("0 */6 * * *", "task-name", async () => {
  // Task code - chạy mỗi 6 giờ
});
```

#### `monthly(name, task, day?, time?)`

Chạy mỗi tháng:

```typescript
this.monthly(
  "task-name",
  async () => {
    // Task code
  },
  1, // Optional day (1-31, default: 1)
  "00:00" // Optional time (default: "00:00")
);
```

#### `yearly(name, task, month?, day?, time?)`

Chạy mỗi năm:

```typescript
this.yearly(
  "task-name",
  async () => {
    // Task code
  },
  1, // Optional month (1-12, default: 1)
  1, // Optional day (1-31, default: 1)
  "00:00" // Optional time (default: "00:00")
);
```

### 3. Scheduler tự động chạy

Scheduler được khởi động tự động khi server start (trong `server.ts`):

```typescript
import { ScheduledTask } from "./cron";

const scheduler = new ScheduledTask();
scheduler.start();
```

Và tự động dừng khi server shutdown.

## Timezone

Timezone được cấu hình trong `SYSTEM_CONFIG` (file `module-base/server/config/index.ts`).

Mặc định timezone là `Asia/Ho_Chi_Minh`. Có thể thay đổi qua environment variable:

- `TZ` (system timezone)

Hoặc override method `getTimezone()` trong ScheduledTask class.

## Logging

Tất cả tasks đều được log:

- Khi task bắt đầu chạy
- Khi task hoàn thành (kèm duration)
- Khi task lỗi (kèm error message)

## Ví dụ: Cleanup expired sessions

Task cleanup expired sessions đã được implement sẵn trong `ScheduledTask.ts`, chạy mỗi ngày lúc 3:00 AM:

```typescript
this.dailyAt("cleanup-expired-sessions", "03:00", async () => {
  console.log("[Cron] Starting cleanup expired sessions...");
  try {
    const sessionModel = new SessionModel();
    const deletedCount = await sessionModel.cleanupExpiredSessions();
    console.log(`[Cron] Cleaned up ${deletedCount} expired session(s)`);
  } catch (error) {
    console.error("[Cron] Error cleaning up expired sessions:", error);
  }
});
```

## Lưu ý quan trọng

1. **Tên task phải duy nhất:** Mỗi task phải có tên duy nhất. Nếu cố gắng đăng ký task với tên đã tồn tại, hệ thống sẽ throw error.

2. **Thứ tự tham số:** Tất cả các methods đều có `name` là tham số đầu tiên (sau các tham số số như minutes/hours) để đảm bảo tính nhất quán.

3. **Timezone:** Timezone được lấy từ `SYSTEM_TIMEZONE` trong `module-base/shared/constants.ts`, có thể override bằng environment variable `TZ`.
