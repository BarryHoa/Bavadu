-- Seed: Các vị trí cần có của một công ty (gắn department ROOT)
-- Chạy sau seed_hrm_departments.sql và có thể sau seed_hrm_positions.sql (CEO, MANAGER, STAFF)

INSERT INTO "mdl_hrm"."positions" (
  "code", "name", "description",
  "department_id", "is_active",
  "created_at", "updated_at"
)
SELECT
  'DIRECTOR',
  jsonb_build_object('en', 'Director', 'vi', 'Giám đốc phòng ban'),
  '{"en": "Department Director", "vi": "Giám đốc phòng ban"}',
  d.id, true, now(), now()
FROM "mdl_hrm"."departments" d
WHERE d.code = 'ROOT' AND NOT EXISTS (SELECT 1 FROM "mdl_hrm"."positions" WHERE "code" = 'DIRECTOR')
LIMIT 1;

INSERT INTO "mdl_hrm"."positions" (
  "code", "name", "description",
  "department_id", "is_active",
  "created_at", "updated_at"
)
SELECT
  'DEPUTY_MANAGER',
  jsonb_build_object('en', 'Deputy Manager', 'vi', 'Phó phòng'),
  '{"en": "Deputy / Assistant Manager", "vi": "Phó phòng"}',
  d.id, true, now(), now()
FROM "mdl_hrm"."departments" d
WHERE d.code = 'ROOT' AND NOT EXISTS (SELECT 1 FROM "mdl_hrm"."positions" WHERE "code" = 'DEPUTY_MANAGER')
LIMIT 1;

INSERT INTO "mdl_hrm"."positions" (
  "code", "name", "description",
  "department_id", "is_active",
  "created_at", "updated_at"
)
SELECT
  'SPECIALIST',
  jsonb_build_object('en', 'Specialist', 'vi', 'Chuyên viên'),
  '{"en": "Specialist", "vi": "Chuyên viên"}',
  d.id, true, now(), now()
FROM "mdl_hrm"."departments" d
WHERE d.code = 'ROOT' AND NOT EXISTS (SELECT 1 FROM "mdl_hrm"."positions" WHERE "code" = 'SPECIALIST')
LIMIT 1;

INSERT INTO "mdl_hrm"."positions" (
  "code", "name", "description",
  "department_id", "is_active",
  "created_at", "updated_at"
)
SELECT
  'SENIOR_STAFF',
  jsonb_build_object('en', 'Senior Staff', 'vi', 'Nhân viên chính'),
  '{"en": "Senior Staff", "vi": "Nhân viên chính"}',
  d.id, true, now(), now()
FROM "mdl_hrm"."departments" d
WHERE d.code = 'ROOT' AND NOT EXISTS (SELECT 1 FROM "mdl_hrm"."positions" WHERE "code" = 'SENIOR_STAFF')
LIMIT 1;

INSERT INTO "mdl_hrm"."positions" (
  "code", "name", "description",
  "department_id", "is_active",
  "created_at", "updated_at"
)
SELECT
  'JUNIOR_STAFF',
  jsonb_build_object('en', 'Junior Staff', 'vi', 'Nhân viên'),
  '{"en": "Junior Staff", "vi": "Nhân viên"}',
  d.id, true, now(), now()
FROM "mdl_hrm"."departments" d
WHERE d.code = 'ROOT' AND NOT EXISTS (SELECT 1 FROM "mdl_hrm"."positions" WHERE "code" = 'JUNIOR_STAFF')
LIMIT 1;

INSERT INTO "mdl_hrm"."positions" (
  "code", "name", "description",
  "department_id", "is_active",
  "created_at", "updated_at"
)
SELECT
  'INTERN',
  jsonb_build_object('en', 'Intern', 'vi', 'Thực tập sinh'),
  '{"en": "Intern", "vi": "Thực tập sinh"}',
  d.id, true, now(), now()
FROM "mdl_hrm"."departments" d
WHERE d.code = 'ROOT' AND NOT EXISTS (SELECT 1 FROM "mdl_hrm"."positions" WHERE "code" = 'INTERN')
LIMIT 1;

INSERT INTO "mdl_hrm"."positions" (
  "code", "name", "description",
  "department_id", "is_active",
  "created_at", "updated_at"
)
SELECT
  'ACCOUNTANT',
  jsonb_build_object('en', 'Accountant', 'vi', 'Kế toán viên'),
  '{"en": "Accountant", "vi": "Kế toán viên"}',
  d.id, true, now(), now()
FROM "mdl_hrm"."departments" d
WHERE d.code = 'ROOT' AND NOT EXISTS (SELECT 1 FROM "mdl_hrm"."positions" WHERE "code" = 'ACCOUNTANT')
LIMIT 1;

INSERT INTO "mdl_hrm"."positions" (
  "code", "name", "description",
  "department_id", "is_active",
  "created_at", "updated_at"
)
SELECT
  'HR_SPECIALIST',
  jsonb_build_object('en', 'HR Specialist', 'vi', 'Chuyên viên nhân sự'),
  '{"en": "HR Specialist", "vi": "Chuyên viên nhân sự"}',
  d.id, true, now(), now()
FROM "mdl_hrm"."departments" d
WHERE d.code = 'ROOT' AND NOT EXISTS (SELECT 1 FROM "mdl_hrm"."positions" WHERE "code" = 'HR_SPECIALIST')
LIMIT 1;

INSERT INTO "mdl_hrm"."positions" (
  "code", "name", "description",
  "department_id", "is_active",
  "created_at", "updated_at"
)
SELECT
  'IT_SPECIALIST',
  jsonb_build_object('en', 'IT Specialist', 'vi', 'Chuyên viên IT'),
  '{"en": "IT Specialist", "vi": "Chuyên viên IT"}',
  d.id, true, now(), now()
FROM "mdl_hrm"."departments" d
WHERE d.code = 'ROOT' AND NOT EXISTS (SELECT 1 FROM "mdl_hrm"."positions" WHERE "code" = 'IT_SPECIALIST')
LIMIT 1;

INSERT INTO "mdl_hrm"."positions" (
  "code", "name", "description",
  "department_id", "is_active",
  "created_at", "updated_at"
)
SELECT
  'SALES_REP',
  jsonb_build_object('en', 'Sales Representative', 'vi', 'Nhân viên kinh doanh'),
  '{"en": "Sales Representative", "vi": "Nhân viên kinh doanh"}',
  d.id, true, now(), now()
FROM "mdl_hrm"."departments" d
WHERE d.code = 'ROOT' AND NOT EXISTS (SELECT 1 FROM "mdl_hrm"."positions" WHERE "code" = 'SALES_REP')
LIMIT 1;
