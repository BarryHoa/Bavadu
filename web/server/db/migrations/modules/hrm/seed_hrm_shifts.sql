-- Migration: Seed HRM shifts
-- Tạo các ca làm việc mặc định

INSERT INTO "mdl_hrm"."shifts" (
	"code", "name", "description",
	"start_time", "end_time", "break_duration", "working_hours",
	"is_night_shift", "is_active",
	"created_at", "updated_at"
) VALUES
	('DAY', jsonb_build_object('en', 'Day Shift', 'vi', 'Ca ngày'), '{"en": "Standard day shift 8:00-17:00", "vi": "Ca ngày tiêu chuẩn 8:00-17:00"}', '08:00', '17:00', 60, 8, false, true, now(), now()),
	('MORNING', jsonb_build_object('en', 'Morning Shift', 'vi', 'Ca sáng'), '{"en": "Morning shift 6:00-14:00", "vi": "Ca sáng 6:00-14:00"}', '06:00', '14:00', 60, 8, false, true, now(), now()),
	('AFTERNOON', jsonb_build_object('en', 'Afternoon Shift', 'vi', 'Ca chiều'), '{"en": "Afternoon shift 14:00-22:00", "vi": "Ca chiều 14:00-22:00"}', '14:00', '22:00', 60, 8, false, true, now(), now()),
	('NIGHT', jsonb_build_object('en', 'Night Shift', 'vi', 'Ca đêm'), '{"en": "Night shift 22:00-06:00", "vi": "Ca đêm 22:00-06:00"}', '22:00', '06:00', 60, 8, true, true, now(), now())
ON CONFLICT ("code") DO NOTHING;
