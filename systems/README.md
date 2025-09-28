# Bava Backend System

Hệ thống backend sử dụng **Fastify + Drizzle ORM + TypeScript + Bun.js** với các tính năng quản lý user, xác thực và phân quyền.

## 🚀 Tính năng

- **User Management**: Đăng ký, đăng nhập, đăng xuất
- **Authentication**: JWT-based authentication
- **User Profile**: Xem và cập nhật thông tin cá nhân
- **Password Management**: Đổi mật khẩu
- **Database**: PostgreSQL với Drizzle ORM (high performance)
- **TypeScript**: Type-safe development
- **Bun.js**: Ultra-fast JavaScript runtime

## Cài đặt

### Yêu cầu hệ thống

- **Bun.js** >= 1.0.0
- **PostgreSQL** >= 12.0

### 1. Cài đặt Bun.js

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows
powershell -c "irm bun.sh/install.ps1 | iex"
```

### 2. Cài đặt dependencies

```bash
cd systems
bun install
```

### 3. Cấu hình environment variables

```bash
cp env.example .env
# Chỉnh sửa file .env với thông tin database của bạn
```

### 4. Chạy server

```bash
# Development mode (với hot reload)
bun run dev

# Production mode
bun run start

# Build cho production
bun run build
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/verify` - Xác thực token

### Users

- `GET /api/users/profile` - Lấy thông tin profile hiện tại
- `PUT /api/users/profile` - Cập nhật thông tin profile
- `PUT /api/users/change-password` - Đổi mật khẩu
- `GET /api/users/` - Lấy danh sách users (có phân trang)

### Health Check

- `GET /health` - Kiểm tra trạng thái server

## Database Schema

Hệ thống sử dụng bảng `users` với cấu trúc:

- `id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR UNIQUE)
- `email` (VARCHAR UNIQUE)
- `password_hash` (VARCHAR)
- `created_at` (TIMESTAMP)

## Environment Variables

- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: Secret key cho JWT
- `JWT_EXPIRES_IN`: Thời gian hết hạn token
- `PORT`: Server port
- `HOST`: Server host
- `NODE_ENV`: Environment mode

## 🛠 Dependencies chính:

- **Fastify**: Web framework nhanh và hiệu quả
- **Drizzle ORM**: High-performance PostgreSQL ORM
- **TypeScript**: Type-safe development
- **Bun.js**: Ultra-fast JavaScript runtime
- **bcryptjs**: Password hashing
- **fastify-jwt**: JWT authentication
- **fastify-cors**: CORS support

## 📁 Cấu trúc thư mục

```
systems/
├── src/
│   ├── db/
│   │   ├── schema.ts         # Database schema (TypeScript)
│   │   └── index.ts          # Database connection
│   ├── routes/
│   │   ├── auth.ts          # Authentication routes
│   │   └── users.ts         # User management routes
│   ├── plugins/
│   │   ├── authenticate.ts  # JWT authentication plugin
│   │   └── database.ts      # Database plugin
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── test/
│   │   └── api.test.ts      # Test files
│   └── server.ts            # Main server file
├── drizzle.config.js        # Drizzle configuration
├── tsconfig.json           # TypeScript configuration
├── bunfig.toml            # Bun configuration
├── package.json
├── env.example
└── README.md
```
