-- Migration: Seed holidays data (Vietnam public holidays)
-- Tạo dữ liệu ngày lễ Việt Nam

-- Ngày lễ cố định hàng năm (recurring)
INSERT INTO "mdl_hrm"."holidays" ("name", "date", "year", "is_recurring", "holiday_type", "country_code", "is_paid", "is_active", "description", "created_at", "updated_at")
VALUES
-- Tết Dương lịch
('{"vi": "Tết Dương lịch", "en": "New Year''s Day"}', '2024-01-01', NULL, true, 'national', 'VN', true, true, 'Nghỉ Tết Dương lịch', NOW(), NOW()),

-- Ngày Giải phóng miền Nam
('{"vi": "Ngày Giải phóng miền Nam", "en": "Liberation Day"}', '2024-04-30', NULL, true, 'national', 'VN', true, true, 'Kỷ niệm ngày giải phóng miền Nam thống nhất đất nước', NOW(), NOW()),

-- Ngày Quốc tế Lao động
('{"vi": "Ngày Quốc tế Lao động", "en": "International Labor Day"}', '2024-05-01', NULL, true, 'national', 'VN', true, true, 'Nghỉ Quốc tế Lao động', NOW(), NOW()),

-- Ngày Quốc khánh
('{"vi": "Ngày Quốc khánh", "en": "National Day"}', '2024-09-02', NULL, true, 'national', 'VN', true, true, 'Kỷ niệm Quốc khánh nước CHXHCN Việt Nam', NOW(), NOW()),

-- Ngày nghỉ bù Quốc khánh (thường là 3/9 nếu 2/9 rơi vào CN)
('{"vi": "Nghỉ bù Quốc khánh", "en": "National Day (observed)"}', '2024-09-03', NULL, true, 'national', 'VN', true, true, 'Nghỉ bù Quốc khánh', NOW(), NOW());

-- Ngày lễ theo năm cụ thể (cần cập nhật hàng năm vì theo âm lịch)
-- Tết Nguyên đán 2024 (10/2 - 14/2/2024, nhằm 1/1 - 5/1 âm lịch Giáp Thìn)
INSERT INTO "mdl_hrm"."holidays" ("name", "date", "year", "is_recurring", "holiday_type", "country_code", "is_paid", "is_active", "description", "created_at", "updated_at")
VALUES
('{"vi": "Tất niên (29 Tết)", "en": "Lunar New Year Eve"}', '2024-02-09', 2024, false, 'national', 'VN', true, true, 'Ngày 29 Tết Giáp Thìn', NOW(), NOW()),
('{"vi": "Tết Nguyên đán (Mùng 1)", "en": "Lunar New Year Day 1"}', '2024-02-10', 2024, false, 'national', 'VN', true, true, 'Mùng 1 Tết Giáp Thìn', NOW(), NOW()),
('{"vi": "Tết Nguyên đán (Mùng 2)", "en": "Lunar New Year Day 2"}', '2024-02-11', 2024, false, 'national', 'VN', true, true, 'Mùng 2 Tết Giáp Thìn', NOW(), NOW()),
('{"vi": "Tết Nguyên đán (Mùng 3)", "en": "Lunar New Year Day 3"}', '2024-02-12', 2024, false, 'national', 'VN', true, true, 'Mùng 3 Tết Giáp Thìn', NOW(), NOW()),
('{"vi": "Tết Nguyên đán (Mùng 4)", "en": "Lunar New Year Day 4"}', '2024-02-13', 2024, false, 'national', 'VN', true, true, 'Mùng 4 Tết Giáp Thìn', NOW(), NOW()),
('{"vi": "Tết Nguyên đán (Mùng 5)", "en": "Lunar New Year Day 5"}', '2024-02-14', 2024, false, 'national', 'VN', true, true, 'Mùng 5 Tết Giáp Thìn', NOW(), NOW());

-- Giỗ Tổ Hùng Vương 2024 (10/3 âm lịch = 18/4/2024 dương lịch)
INSERT INTO "mdl_hrm"."holidays" ("name", "date", "year", "is_recurring", "holiday_type", "country_code", "is_paid", "is_active", "description", "created_at", "updated_at")
VALUES
('{"vi": "Giỗ Tổ Hùng Vương", "en": "Hung Kings'' Temple Festival"}', '2024-04-18', 2024, false, 'national', 'VN', true, true, 'Giỗ Tổ Hùng Vương (10/3 Âm lịch)', NOW(), NOW());

-- Tết Nguyên đán 2025 (29/1 - 2/2/2025, nhằm 1/1 - 5/1 âm lịch Ất Tỵ)
INSERT INTO "mdl_hrm"."holidays" ("name", "date", "year", "is_recurring", "holiday_type", "country_code", "is_paid", "is_active", "description", "created_at", "updated_at")
VALUES
('{"vi": "Tất niên (29 Tết)", "en": "Lunar New Year Eve"}', '2025-01-28', 2025, false, 'national', 'VN', true, true, 'Ngày 29 Tết Ất Tỵ', NOW(), NOW()),
('{"vi": "Tết Nguyên đán (Mùng 1)", "en": "Lunar New Year Day 1"}', '2025-01-29', 2025, false, 'national', 'VN', true, true, 'Mùng 1 Tết Ất Tỵ', NOW(), NOW()),
('{"vi": "Tết Nguyên đán (Mùng 2)", "en": "Lunar New Year Day 2"}', '2025-01-30', 2025, false, 'national', 'VN', true, true, 'Mùng 2 Tết Ất Tỵ', NOW(), NOW()),
('{"vi": "Tết Nguyên đán (Mùng 3)", "en": "Lunar New Year Day 3"}', '2025-01-31', 2025, false, 'national', 'VN', true, true, 'Mùng 3 Tết Ất Tỵ', NOW(), NOW()),
('{"vi": "Tết Nguyên đán (Mùng 4)", "en": "Lunar New Year Day 4"}', '2025-02-01', 2025, false, 'national', 'VN', true, true, 'Mùng 4 Tết Ất Tỵ', NOW(), NOW()),
('{"vi": "Tết Nguyên đán (Mùng 5)", "en": "Lunar New Year Day 5"}', '2025-02-02', 2025, false, 'national', 'VN', true, true, 'Mùng 5 Tết Ất Tỵ', NOW(), NOW());

-- Giỗ Tổ Hùng Vương 2025 (10/3 âm lịch = 7/4/2025 dương lịch)
INSERT INTO "mdl_hrm"."holidays" ("name", "date", "year", "is_recurring", "holiday_type", "country_code", "is_paid", "is_active", "description", "created_at", "updated_at")
VALUES
('{"vi": "Giỗ Tổ Hùng Vương", "en": "Hung Kings'' Temple Festival"}', '2025-04-07', 2025, false, 'national', 'VN', true, true, 'Giỗ Tổ Hùng Vương (10/3 Âm lịch)', NOW(), NOW());

-- Tết Nguyên đán 2026 (16/2 - 20/2/2026, nhằm 1/1 - 5/1 âm lịch Bính Ngọ)
INSERT INTO "mdl_hrm"."holidays" ("name", "date", "year", "is_recurring", "holiday_type", "country_code", "is_paid", "is_active", "description", "created_at", "updated_at")
VALUES
('{"vi": "Tất niên (29 Tết)", "en": "Lunar New Year Eve"}', '2026-02-16', 2026, false, 'national', 'VN', true, true, 'Ngày 29 Tết Bính Ngọ', NOW(), NOW()),
('{"vi": "Tết Nguyên đán (Mùng 1)", "en": "Lunar New Year Day 1"}', '2026-02-17', 2026, false, 'national', 'VN', true, true, 'Mùng 1 Tết Bính Ngọ', NOW(), NOW()),
('{"vi": "Tết Nguyên đán (Mùng 2)", "en": "Lunar New Year Day 2"}', '2026-02-18', 2026, false, 'national', 'VN', true, true, 'Mùng 2 Tết Bính Ngọ', NOW(), NOW()),
('{"vi": "Tết Nguyên đán (Mùng 3)", "en": "Lunar New Year Day 3"}', '2026-02-19', 2026, false, 'national', 'VN', true, true, 'Mùng 3 Tết Bính Ngọ', NOW(), NOW()),
('{"vi": "Tết Nguyên đán (Mùng 4)", "en": "Lunar New Year Day 4"}', '2026-02-20', 2026, false, 'national', 'VN', true, true, 'Mùng 4 Tết Bính Ngọ', NOW(), NOW()),
('{"vi": "Tết Nguyên đán (Mùng 5)", "en": "Lunar New Year Day 5"}', '2026-02-21', 2026, false, 'national', 'VN', true, true, 'Mùng 5 Tết Bính Ngọ', NOW(), NOW());

-- Giỗ Tổ Hùng Vương 2026 (10/3 âm lịch = 26/4/2026 dương lịch)
INSERT INTO "mdl_hrm"."holidays" ("name", "date", "year", "is_recurring", "holiday_type", "country_code", "is_paid", "is_active", "description", "created_at", "updated_at")
VALUES
('{"vi": "Giỗ Tổ Hùng Vương", "en": "Hung Kings'' Temple Festival"}', '2026-04-26', 2026, false, 'national', 'VN', true, true, 'Giỗ Tổ Hùng Vương (10/3 Âm lịch)', NOW(), NOW());
