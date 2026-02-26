-- Migration: Seed additional HRM permissions for resources not in base seed_permissions
-- Resources: position, contract, shift, leave_type, job_requisition, candidate, course, certificate, performance_review

-- Position
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES
('hrm.position.view', 'hrm', 'position', 'view', '{"en": "View Positions", "vi": "Xem chức vụ"}', '{"en": "Permission to view positions", "vi": "Quyền xem chức vụ"}', true, now()),
('hrm.position.create', 'hrm', 'position', 'create', '{"en": "Create Positions", "vi": "Tạo chức vụ"}', '{"en": "Permission to create positions", "vi": "Quyền tạo chức vụ"}', true, now()),
('hrm.position.update', 'hrm', 'position', 'update', '{"en": "Update Positions", "vi": "Cập nhật chức vụ"}', '{"en": "Permission to update positions", "vi": "Quyền cập nhật chức vụ"}', true, now()),
('hrm.position.delete', 'hrm', 'position', 'delete', '{"en": "Delete Positions", "vi": "Xóa chức vụ"}', '{"en": "Permission to delete positions", "vi": "Quyền xóa chức vụ"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- Contract
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES
('hrm.contract.view', 'hrm', 'contract', 'view', '{"en": "View Contracts", "vi": "Xem hợp đồng"}', '{"en": "Permission to view contracts", "vi": "Quyền xem hợp đồng"}', true, now()),
('hrm.contract.create', 'hrm', 'contract', 'create', '{"en": "Create Contracts", "vi": "Tạo hợp đồng"}', '{"en": "Permission to create contracts", "vi": "Quyền tạo hợp đồng"}', true, now()),
('hrm.contract.update', 'hrm', 'contract', 'update', '{"en": "Update Contracts", "vi": "Cập nhật hợp đồng"}', '{"en": "Permission to update contracts", "vi": "Quyền cập nhật hợp đồng"}', true, now()),
('hrm.contract.delete', 'hrm', 'contract', 'delete', '{"en": "Delete Contracts", "vi": "Xóa hợp đồng"}', '{"en": "Permission to delete contracts", "vi": "Quyền xóa hợp đồng"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- Shift
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES
('hrm.shift.view', 'hrm', 'shift', 'view', '{"en": "View Shifts", "vi": "Xem ca làm việc"}', '{"en": "Permission to view shifts", "vi": "Quyền xem ca làm việc"}', true, now()),
('hrm.shift.create', 'hrm', 'shift', 'create', '{"en": "Create Shifts", "vi": "Tạo ca làm việc"}', '{"en": "Permission to create shifts", "vi": "Quyền tạo ca làm việc"}', true, now()),
('hrm.shift.update', 'hrm', 'shift', 'update', '{"en": "Update Shifts", "vi": "Cập nhật ca làm việc"}', '{"en": "Permission to update shifts", "vi": "Quyền cập nhật ca làm việc"}', true, now()),
('hrm.shift.delete', 'hrm', 'shift', 'delete', '{"en": "Delete Shifts", "vi": "Xóa ca làm việc"}', '{"en": "Permission to delete shifts", "vi": "Quyền xóa ca làm việc"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- Leave Type
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES
('hrm.leave_type.view', 'hrm', 'leave_type', 'view', '{"en": "View Leave Types", "vi": "Xem loại nghỉ phép"}', '{"en": "Permission to view leave types", "vi": "Quyền xem loại nghỉ phép"}', true, now()),
('hrm.leave_type.create', 'hrm', 'leave_type', 'create', '{"en": "Create Leave Types", "vi": "Tạo loại nghỉ phép"}', '{"en": "Permission to create leave types", "vi": "Quyền tạo loại nghỉ phép"}', true, now()),
('hrm.leave_type.update', 'hrm', 'leave_type', 'update', '{"en": "Update Leave Types", "vi": "Cập nhật loại nghỉ phép"}', '{"en": "Permission to update leave types", "vi": "Quyền cập nhật loại nghỉ phép"}', true, now()),
('hrm.leave_type.delete', 'hrm', 'leave_type', 'delete', '{"en": "Delete Leave Types", "vi": "Xóa loại nghỉ phép"}', '{"en": "Permission to delete leave types", "vi": "Quyền xóa loại nghỉ phép"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- Job Requisition
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES
('hrm.job_requisition.view', 'hrm', 'job_requisition', 'view', '{"en": "View Job Requisitions", "vi": "Xem yêu cầu tuyển dụng"}', '{"en": "Permission to view job requisitions", "vi": "Quyền xem yêu cầu tuyển dụng"}', true, now()),
('hrm.job_requisition.create', 'hrm', 'job_requisition', 'create', '{"en": "Create Job Requisitions", "vi": "Tạo yêu cầu tuyển dụng"}', '{"en": "Permission to create job requisitions", "vi": "Quyền tạo yêu cầu tuyển dụng"}', true, now()),
('hrm.job_requisition.update', 'hrm', 'job_requisition', 'update', '{"en": "Update Job Requisitions", "vi": "Cập nhật yêu cầu tuyển dụng"}', '{"en": "Permission to update job requisitions", "vi": "Quyền cập nhật yêu cầu tuyển dụng"}', true, now()),
('hrm.job_requisition.delete', 'hrm', 'job_requisition', 'delete', '{"en": "Delete Job Requisitions", "vi": "Xóa yêu cầu tuyển dụng"}', '{"en": "Permission to delete job requisitions", "vi": "Quyền xóa yêu cầu tuyển dụng"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- Candidate
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES
('hrm.candidate.view', 'hrm', 'candidate', 'view', '{"en": "View Candidates", "vi": "Xem ứng viên"}', '{"en": "Permission to view candidates", "vi": "Quyền xem ứng viên"}', true, now()),
('hrm.candidate.create', 'hrm', 'candidate', 'create', '{"en": "Create Candidates", "vi": "Tạo ứng viên"}', '{"en": "Permission to create candidates", "vi": "Quyền tạo ứng viên"}', true, now()),
('hrm.candidate.update', 'hrm', 'candidate', 'update', '{"en": "Update Candidates", "vi": "Cập nhật ứng viên"}', '{"en": "Permission to update candidates", "vi": "Quyền cập nhật ứng viên"}', true, now()),
('hrm.candidate.delete', 'hrm', 'candidate', 'delete', '{"en": "Delete Candidates", "vi": "Xóa ứng viên"}', '{"en": "Permission to delete candidates", "vi": "Quyền xóa ứng viên"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- Course
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES
('hrm.course.view', 'hrm', 'course', 'view', '{"en": "View Courses", "vi": "Xem khóa học"}', '{"en": "Permission to view courses", "vi": "Quyền xem khóa học"}', true, now()),
('hrm.course.create', 'hrm', 'course', 'create', '{"en": "Create Courses", "vi": "Tạo khóa học"}', '{"en": "Permission to create courses", "vi": "Quyền tạo khóa học"}', true, now()),
('hrm.course.update', 'hrm', 'course', 'update', '{"en": "Update Courses", "vi": "Cập nhật khóa học"}', '{"en": "Permission to update courses", "vi": "Quyền cập nhật khóa học"}', true, now()),
('hrm.course.delete', 'hrm', 'course', 'delete', '{"en": "Delete Courses", "vi": "Xóa khóa học"}', '{"en": "Permission to delete courses", "vi": "Quyền xóa khóa học"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- Certificate
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES
('hrm.certificate.view', 'hrm', 'certificate', 'view', '{"en": "View Certificates", "vi": "Xem chứng chỉ"}', '{"en": "Permission to view certificates", "vi": "Quyền xem chứng chỉ"}', true, now()),
('hrm.certificate.create', 'hrm', 'certificate', 'create', '{"en": "Create Certificates", "vi": "Tạo chứng chỉ"}', '{"en": "Permission to create certificates", "vi": "Quyền tạo chứng chỉ"}', true, now()),
('hrm.certificate.update', 'hrm', 'certificate', 'update', '{"en": "Update Certificates", "vi": "Cập nhật chứng chỉ"}', '{"en": "Permission to update certificates", "vi": "Quyền cập nhật chứng chỉ"}', true, now()),
('hrm.certificate.delete', 'hrm', 'certificate', 'delete', '{"en": "Delete Certificates", "vi": "Xóa chứng chỉ"}', '{"en": "Permission to delete certificates", "vi": "Quyền xóa chứng chỉ"}', true, now())
ON CONFLICT ("key") DO NOTHING;

-- Performance Review
INSERT INTO "md_base"."permissions" ("key", "module", "resource", "action", "name", "description", "is_active", "created_at")
VALUES
('hrm.performance_review.view', 'hrm', 'performance_review', 'view', '{"en": "View Performance Reviews", "vi": "Xem đánh giá hiệu suất"}', '{"en": "Permission to view performance reviews", "vi": "Quyền xem đánh giá hiệu suất"}', true, now()),
('hrm.performance_review.create', 'hrm', 'performance_review', 'create', '{"en": "Create Performance Reviews", "vi": "Tạo đánh giá hiệu suất"}', '{"en": "Permission to create performance reviews", "vi": "Quyền tạo đánh giá hiệu suất"}', true, now()),
('hrm.performance_review.update', 'hrm', 'performance_review', 'update', '{"en": "Update Performance Reviews", "vi": "Cập nhật đánh giá hiệu suất"}', '{"en": "Permission to update performance reviews", "vi": "Quyền cập nhật đánh giá hiệu suất"}', true, now()),
('hrm.performance_review.delete', 'hrm', 'performance_review', 'delete', '{"en": "Delete Performance Reviews", "vi": "Xóa đánh giá hiệu suất"}', '{"en": "Permission to delete performance reviews", "vi": "Quyền xóa đánh giá hiệu suất"}', true, now())
ON CONFLICT ("key") DO NOTHING;
