-- Insert 10 mẫu user để test
-- Mật khẩu cho tất cả user là: password123 (đã hash bằng bcrypt)
INSERT INTO users (
    username,
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    date_of_birth,
    gender,
    address,
    city,
    state,
    country,
    role,
    status,
    is_verified,
    is_email_verified
  )
VALUES -- Admin user
  (
    'admin',
    'admin@bava.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4j4j4j4j4j',
    'Admin',
    'User',
    '+84123456789',
    '1990-01-01',
    'male',
    '123 Admin Street',
    'Ho Chi Minh',
    'Ho Chi Minh',
    'Vietnam',
    'admin',
    'active',
    true,
    true
  ),
  -- Moderator user  
  (
    'moderator',
    'moderator@bava.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4j4j4j4j4j',
    'Moderator',
    'User',
    '+84123456790',
    '1991-02-02',
    'female',
    '456 Moderator Ave',
    'Hanoi',
    'Hanoi',
    'Vietnam',
    'moderator',
    'active',
    true,
    true
  ),
  -- Regular users
  (
    'john_doe',
    'john.doe@email.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4j4j4j4j4j',
    'John',
    'Doe',
    '+84123456791',
    '1992-03-15',
    'male',
    '789 Main Street',
    'Da Nang',
    'Da Nang',
    'Vietnam',
    'user',
    'active',
    true,
    true
  ),
  (
    'jane_smith',
    'jane.smith@email.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4j4j4j4j4j',
    'Jane',
    'Smith',
    '+84123456792',
    '1993-04-20',
    'female',
    '321 Oak Avenue',
    'Can Tho',
    'Can Tho',
    'Vietnam',
    'user',
    'active',
    true,
    true
  ),
  (
    'mike_wilson',
    'mike.wilson@email.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4j4j4j4j4j',
    'Mike',
    'Wilson',
    '+84123456793',
    '1994-05-25',
    'male',
    '654 Pine Road',
    'Hue',
    'Thua Thien Hue',
    'Vietnam',
    'user',
    'active',
    true,
    true
  ),
  (
    'sarah_johnson',
    'sarah.johnson@email.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4j4j4j4j4j',
    'Sarah',
    'Johnson',
    '+84123456794',
    '1995-06-10',
    'female',
    '987 Elm Street',
    'Nha Trang',
    'Khanh Hoa',
    'Vietnam',
    'user',
    'active',
    true,
    true
  ),
  (
    'david_brown',
    'david.brown@email.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4j4j4j4j4j',
    'David',
    'Brown',
    '+84123456795',
    '1996-07-05',
    'male',
    '147 Maple Drive',
    'Vung Tau',
    'Ba Ria - Vung Tau',
    'Vietnam',
    'user',
    'active',
    true,
    true
  ),
  (
    'lisa_davis',
    'lisa.davis@email.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4j4j4j4j4j',
    'Lisa',
    'Davis',
    '+84123456796',
    '1997-08-12',
    'female',
    '258 Cedar Lane',
    'Quy Nhon',
    'Binh Dinh',
    'Vietnam',
    'user',
    'active',
    true,
    true
  ),
  (
    'tom_miller',
    'tom.miller@email.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4j4j4j4j4j',
    'Tom',
    'Miller',
    '+84123456797',
    '1998-09-18',
    'male',
    '369 Birch Court',
    'Buon Ma Thuot',
    'Dak Lak',
    'Vietnam',
    'user',
    'active',
    true,
    true
  ),
  (
    'emma_garcia',
    'emma.garcia@email.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4j4j4j4j4j',
    'Emma',
    'Garcia',
    '+84123456798',
    '1999-10-30',
    'female',
    '741 Spruce Way',
    'Rach Gia',
    'Kien Giang',
    'Vietnam',
    'user',
    'active',
    true,
    true
  );
-- Cập nhật last_login cho một số user
UPDATE users
SET last_login = CURRENT_TIMESTAMP - INTERVAL '1 day'
WHERE username = 'admin';
UPDATE users
SET last_login = CURRENT_TIMESTAMP - INTERVAL '2 hours'
WHERE username = 'john_doe';
UPDATE users
SET last_login = CURRENT_TIMESTAMP - INTERVAL '30 minutes'
WHERE username = 'jane_smith';
-- Thêm một số user sessions mẫu
INSERT INTO user_sessions (
    user_id,
    session_token,
    ip_address,
    user_agent,
    expires_at
  )
VALUES (
    1,
    'admin_session_123',
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    CURRENT_TIMESTAMP + INTERVAL '24 hours'
  ),
  (
    3,
    'john_session_456',
    '192.168.1.101',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    CURRENT_TIMESTAMP + INTERVAL '12 hours'
  ),
  (
    4,
    'jane_session_789',
    '192.168.1.102',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
    CURRENT_TIMESTAMP + INTERVAL '6 hours'
  );
-- Thêm một số user activities mẫu
INSERT INTO user_activities (
    user_id,
    activity_type,
    description,
    ip_address,
    user_agent
  )
VALUES (
    1,
    'login',
    'User logged in successfully',
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  ),
  (
    1,
    'profile_update',
    'Updated profile information',
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  ),
  (
    3,
    'login',
    'User logged in successfully',
    '192.168.1.101',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  ),
  (
    4,
    'login',
    'User logged in successfully',
    '192.168.1.102',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  ),
  (
    4,
    'password_change',
    'Password changed successfully',
    '192.168.1.102',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  );