-- Migration: Drop notifications table from HRM (moved to base)
-- Xóa bảng notifications khỏi mdl_hrm (đã chuyển sang md_base)

DROP TABLE IF EXISTS "mdl_hrm"."notifications";
