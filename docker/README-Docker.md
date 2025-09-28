# Docker Setup cho PostgreSQL và pgAdmin

## Cài đặt và chạy

### 1. Tạo file .env

Tạo file `.env` từ file `env.example`:

```bash
cp env.example .env
```

Sau đó chỉnh sửa các giá trị trong file `.env` theo nhu cầu của bạn.

### 2. Chạy Docker Compose

```bash
# Chạy các container
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng các container
docker-compose down

# Dừng và xóa volumes (cảnh báo: sẽ mất dữ liệu)
docker-compose down -v
```

## Truy cập các dịch vụ

### PostgreSQL

- **Host**: postgres
- **Port**: 5432
- **Database**: bava_db (hoặc giá trị trong .env)
- **Username**: bava_user (hoặc giá trị trong .env)
- **Password**: bava_password (hoặc giá trị trong .env)

### pgAdmin

- **URL**: http://localhost:8080
- **Email**: admin@bava.com (hoặc giá trị trong .env)
- **Password**: admin123 (hoặc giá trị trong .env)

## Kết nối pgAdmin với PostgreSQL

1. Mở pgAdmin tại http://localhost:8080
2. Đăng nhập với thông tin trong file .env
3. Click chuột phải vào "Servers" → "Register" → "Server"
4. Trong tab "General":
   - Name: Bava PostgreSQL
5. Trong tab "Connection":
   - Host name/address: postgres
   - Port: 5432
   - Username: bava_user (hoặc giá trị trong .env)
   - Password: bava_password (hoặc giá trị trong .env)
6. Click "Save"

## Cấu trúc thư mục

```
.
├── docker-compose.yml    # File cấu hình Docker Compose
├── env.example          # File mẫu cho biến môi trường
├── .env                 # File biến môi trường (tạo từ env.example)
└── init-scripts/        # Thư mục chứa script khởi tạo database (tùy chọn)
```

## Lưu ý

- Dữ liệu PostgreSQL được lưu trong Docker volume `postgres_data`
- Cấu hình pgAdmin được lưu trong Docker volume `pgadmin_data`
- Các container sẽ tự động restart trừ khi bị dừng thủ công
- Có thể thêm script SQL vào thư mục `init-scripts/` để chạy khi khởi tạo database
