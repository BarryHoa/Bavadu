-- Seed: Các phòng ban cần có của một công ty (con của ROOT / Trụ sở chính)
-- Chạy sau seed_hrm_departments.sql (đã có ROOT)

INSERT INTO "mdl_hrm"."departments" (
  "code", "name", "description",
  "parent_id", "level", "is_active",
  "created_at", "updated_at"
)
SELECT
  'HR',
  jsonb_build_object('en', 'Human Resources', 'vi', 'Phòng Nhân sự'),
  '{"en": "Human Resources - Recruitment, payroll, policies", "vi": "Nhân sự - Tuyển dụng, lương, chính sách"}',
  d.id, 1, true, now(), now()
FROM "mdl_hrm"."departments" d WHERE d.code = 'ROOT' LIMIT 1
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "mdl_hrm"."departments" (
  "code", "name", "description",
  "parent_id", "level", "is_active",
  "created_at", "updated_at"
)
SELECT
  'IT',
  jsonb_build_object('en', 'Information Technology', 'vi', 'Phòng Công nghệ thông tin'),
  '{"en": "IT - Systems, infrastructure, support", "vi": "CNTT - Hệ thống, hạ tầng, hỗ trợ"}',
  d.id, 1, true, now(), now()
FROM "mdl_hrm"."departments" d WHERE d.code = 'ROOT' LIMIT 1
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "mdl_hrm"."departments" (
  "code", "name", "description",
  "parent_id", "level", "is_active",
  "created_at", "updated_at"
)
SELECT
  'SALES',
  jsonb_build_object('en', 'Sales', 'vi', 'Phòng Kinh doanh'),
  '{"en": "Sales - Revenue, customers, contracts", "vi": "Kinh doanh - Doanh thu, khách hàng, hợp đồng"}',
  d.id, 1, true, now(), now()
FROM "mdl_hrm"."departments" d WHERE d.code = 'ROOT' LIMIT 1
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "mdl_hrm"."departments" (
  "code", "name", "description",
  "parent_id", "level", "is_active",
  "created_at", "updated_at"
)
SELECT
  'FINANCE',
  jsonb_build_object('en', 'Finance & Accounting', 'vi', 'Phòng Tài chính - Kế toán'),
  '{"en": "Finance - Accounting, treasury, reporting", "vi": "Tài chính - Kế toán, quỹ, báo cáo"}',
  d.id, 1, true, now(), now()
FROM "mdl_hrm"."departments" d WHERE d.code = 'ROOT' LIMIT 1
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "mdl_hrm"."departments" (
  "code", "name", "description",
  "parent_id", "level", "is_active",
  "created_at", "updated_at"
)
SELECT
  'MARKETING',
  jsonb_build_object('en', 'Marketing', 'vi', 'Phòng Marketing'),
  '{"en": "Marketing - Brand, campaigns, digital", "vi": "Marketing - Thương hiệu, chiến dịch, digital"}',
  d.id, 1, true, now(), now()
FROM "mdl_hrm"."departments" d WHERE d.code = 'ROOT' LIMIT 1
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "mdl_hrm"."departments" (
  "code", "name", "description",
  "parent_id", "level", "is_active",
  "created_at", "updated_at"
)
SELECT
  'OPERATIONS',
  jsonb_build_object('en', 'Operations', 'vi', 'Phòng Vận hành'),
  '{"en": "Operations - Day-to-day operations, processes", "vi": "Vận hành - Vận hành hàng ngày, quy trình"}',
  d.id, 1, true, now(), now()
FROM "mdl_hrm"."departments" d WHERE d.code = 'ROOT' LIMIT 1
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "mdl_hrm"."departments" (
  "code", "name", "description",
  "parent_id", "level", "is_active",
  "created_at", "updated_at"
)
SELECT
  'ADMIN',
  jsonb_build_object('en', 'Administration', 'vi', 'Phòng Hành chính'),
  '{"en": "Admin - Facilities, documents, general affairs", "vi": "Hành chính - Cơ sở vật chất, văn thư, tổng hợp"}',
  d.id, 1, true, now(), now()
FROM "mdl_hrm"."departments" d WHERE d.code = 'ROOT' LIMIT 1
ON CONFLICT ("code") DO NOTHING;
