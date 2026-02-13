-- Seed data for users and users_login tables
-- Seed dataset providing ~20 records per table for development and testing

-- Users
INSERT INTO "md_base"."users" (
  "avatar",
  "gender",
  "date_of_birth",
  "bio",
  "first_name",
  "last_name",
  "phones",
  "addresses",
  "emails",
  "address",
  "notes",
  "status",
  "is_verified",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  CONCAT('https://example.com/avatar/', gs, '.png'),
  (ARRAY['male', 'female', 'other'])[((gs - 1) % 3) + 1],
  DATE '1985-01-01' + (gs * INTERVAL '120 days'),
  CONCAT('Bio for user ', gs),
  CONCAT('First', gs),
  CONCAT('Last', gs),
  ARRAY[CONCAT('+84-09', LPAD(gs::text, 3, '0'))],
  ARRAY[CONCAT('Address ', gs)],
  ARRAY[CONCAT('user', gs, '@example.com')],
  jsonb_build_object('line1', CONCAT('Street ', gs), 'city', 'Hanoi', 'country', 'VN'),
  CONCAT('Notes ', gs),
  (ARRAY['active', 'inactive', 'block'])[((gs - 1) % 3) + 1],
  gs % 2 = 0,
  NOW() - (gs || ' days')::INTERVAL,
  NOW(),
  NULL,
  NULL
FROM generate_series(1, 20) AS gs;

-- User login credentials
WITH user_rows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM "md_base"."users"
  ORDER BY created_at, id
  LIMIT 20
)
INSERT INTO "md_base"."users_login" (
  "user_id",
  "username",
  "email",
  "phone",
  "password_hash",
  "last_login_at",
  "last_login_ip",
  "last_login_user_agent",
  "last_login_location",
  "last_login_device",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  id,
  CONCAT('user', rn),
  CONCAT('user', rn, '@example.com'),
  CONCAT('+84-090', LPAD(rn::text, 3, '0')),
  '$2a$10$SeededBavaduPasswordHashExample000000000000000000000',
  NOW() - (rn || ' days')::INTERVAL,
  CONCAT('192.168.1.', rn),
  'Mozilla/5.0 (Seed Script)',
  'Hanoi, VN',
  CONCAT('Device-', rn),
  NOW() - (rn || ' days')::INTERVAL,
  NOW(),
  NULL,
  NULL
FROM user_rows
ON CONFLICT ("username") DO NOTHING;

