# Thông tin đăng nhập mẫu

## 🔐 **Thông tin đăng nhập cho 10 user mẫu:**

### **Admin User:**

- **Username**: `admin`
- **Email**: `admin@bava.com`
- **Password**: `password123`
- **Role**: `admin`

### **Moderator User:**

- **Username**: `moderator`
- **Email**: `moderator@bava.com`
- **Password**: `password123`
- **Role**: `moderator`

### **Regular Users:**

1. **Username**: `john_doe`

   - **Email**: `john.doe@email.com`
   - **Password**: `password123`
   - **Role**: `user`

2. **Username**: `jane_smith`

   - **Email**: `jane.smith@email.com`
   - **Password**: `password123`
   - **Role**: `user`

3. **Username**: `mike_wilson`

   - **Email**: `mike.wilson@email.com`
   - **Password**: `password123`
   - **Role**: `user`

4. **Username**: `sarah_johnson`

   - **Email**: `sarah.johnson@email.com`
   - **Password**: `password123`
   - **Role**: `user`

5. **Username**: `david_brown`

   - **Email**: `david.brown@email.com`
   - **Password**: `password123`
   - **Role**: `user`

6. **Username**: `lisa_davis`

   - **Email**: `lisa.davis@email.com`
   - **Password**: `password123`
   - **Role**: `user`

7. **Username**: `tom_miller`

   - **Email**: `tom.miller@email.com`
   - **Password**: `password123`
   - **Role**: `user`

8. **Username**: `emma_garcia`
   - **Email**: `emma.garcia@email.com`
   - **Password**: `password123`
   - **Role**: `user`

## 📊 **Thông tin bổ sung:**

- **Tất cả user đều có trạng thái**: `active`
- **Tất cả user đều đã verify email**: `true`
- **Mật khẩu cho tất cả user**: `password123` (đã được hash bằng bcrypt)
- **Một số user đã có last_login** để test tính năng theo dõi hoạt động

## 🔧 **Cách sử dụng:**

1. **Kết nối PostgreSQL**:

   - Host: `localhost` hoặc `postgres`
   - Port: `5432`
   - Database: `bava_db`
   - Username: `bava_user`
   - Password: `bava_password`

2. **Truy cập pgAdmin**:

   - URL: http://localhost:8080
   - Email: `admin@bava.com`
   - Password: `admin123`

3. **Test đăng nhập** với bất kỳ user nào ở trên

## 📝 **Lưu ý:**

- Mật khẩu thực tế trong database đã được hash, không phải plain text
- Để test authentication, bạn cần implement logic hash password trong ứng dụng
- Có thể sử dụng bcrypt để hash password mới
