# Hướng dẫn cài đặt và chạy hệ thống Backend

## Yêu cầu hệ thống

- **Bun.js** >= 1.0.0 (thay thế Node.js)
- **PostgreSQL** >= 12.0
- **TypeScript** (được cài đặt tự động với Bun)

## Cài đặt

### 1. Cài đặt Bun.js

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# Kiểm tra cài đặt
bun --version
```

### 2. Cài đặt dependencies

```bash
cd systems
bun install
```

### 3. Cấu hình Database

Đảm bảo PostgreSQL đang chạy và tạo database:

```sql
CREATE DATABASE bava_db;
CREATE USER bava_user WITH PASSWORD 'bava_password';
GRANT ALL PRIVILEGES ON DATABASE bava_db TO bava_user;
```

### 4. Cấu hình Environment Variables

```bash
cp env.example .env
```

Chỉnh sửa file `.env` với thông tin database của bạn:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bava_db
DB_USER=bava_user
DB_PASSWORD=bava_password
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
```

### 5. Tạo bảng users

Chạy script SQL để tạo bảng users (sử dụng file từ thư mục docker/init-scripts):

```sql
-- Tạo bảng users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Chạy hệ thống

### Development mode (với hot reload)

```bash
bun run dev
```

### Production mode

```bash
bun run start
```

### Build cho production

```bash
bun run build
```

Server sẽ chạy tại `http://localhost:3000`

## Testing

```bash
# Chạy tests
bun test

# Type checking
bun run type-check
```

## API Testing với curl

### 1. Đăng ký user mới

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Đăng nhập

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 3. Lấy thông tin profile (cần token)

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Cập nhật profile

```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "username": "newusername",
    "email": "newemail@example.com"
  }'
```

### 5. Đổi mật khẩu

```bash
curl -X PUT http://localhost:3000/api/users/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

## Troubleshooting

### Lỗi kết nối database

- Kiểm tra PostgreSQL có đang chạy không
- Kiểm tra thông tin kết nối trong file `.env`
- Đảm bảo database và user đã được tạo

### Lỗi JWT

- Kiểm tra `JWT_SECRET` trong file `.env`
- Đảm bảo token được gửi đúng format: `Bearer YOUR_TOKEN`

### Lỗi CORS

- Kiểm tra cấu hình CORS trong file `src/server.js`
- Đảm bảo frontend gửi request từ domain được phép
