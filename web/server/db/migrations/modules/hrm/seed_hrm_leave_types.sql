-- Migration: Seed HRM leave types
-- Tạo các loại nghỉ phép mặc định

INSERT INTO "mdl_hrm"."leave_types" (
	"code", "name", "description",
	"accrual_type", "accrual_rate", "max_accrual",
	"carry_forward", "max_carry_forward",
	"requires_approval", "is_paid", "is_active",
	"created_at", "updated_at"
) VALUES
	('ANNUAL', jsonb_build_object('en', 'Annual Leave', 'vi', 'Nghỉ phép năm'), '{"en": "Annual leave entitlement", "vi": "Nghỉ phép năm theo quy định"}', 'yearly', 12, 24, true, 5, true, true, true, now(), now()),
	('SICK', jsonb_build_object('en', 'Sick Leave', 'vi', 'Nghỉ ốm'), '{"en": "Leave for medical reasons", "vi": "Nghỉ ốm, có giấy xác nhận bác sĩ"}', 'unlimited', NULL, NULL, false, NULL, true, true, true, now(), now()),
	('PERSONAL', jsonb_build_object('en', 'Personal Leave', 'vi', 'Nghỉ việc riêng'), '{"en": "Personal matters leave", "vi": "Nghỉ việc riêng (tang chế, cưới hỏi, v.v.)"}', 'yearly', 5, 10, false, NULL, true, true, true, now(), now()),
	('MATERNITY', jsonb_build_object('en', 'Maternity Leave', 'vi', 'Nghỉ thai sản'), '{"en": "Maternity leave for female employees", "vi": "Nghỉ thai sản cho nhân viên nữ"}', 'per_occurrence', NULL, NULL, false, NULL, true, true, true, now(), now()),
	('UNPAID', jsonb_build_object('en', 'Unpaid Leave', 'vi', 'Nghỉ không lương'), '{"en": "Unpaid leave", "vi": "Nghỉ không lương"}', 'unlimited', NULL, NULL, false, NULL, true, false, true, now(), now())
ON CONFLICT ("code") DO NOTHING;
