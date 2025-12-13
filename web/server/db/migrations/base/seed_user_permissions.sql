-- Migration: Seed user permissions
-- Gán permissions bổ sung cho users (ngoài permissions từ roles)
-- File này có thể để trống ban đầu, dùng để thêm permissions đặc biệt cho từng user

-- ============================================
-- Example: Thêm permission đặc biệt cho user cụ thể
-- ============================================
-- Ví dụ: User có role Employee nhưng cần thêm quyền approve purchase orders
-- 
-- INSERT INTO "md_base"."user_permissions" ("user_id", "permission_id", "is_active", "created_at")
-- SELECT 
-- 	u.id,
-- 	p.id,
-- 	true,
-- 	now()
-- FROM "md_base"."users" u
-- CROSS JOIN "md_base"."permissions" p
-- WHERE u.id = 'USER_ID_HERE'::uuid
-- 	AND p.key = 'purchase.order.approve'
-- ON CONFLICT ("user_id", "permission_id") DO NOTHING;

-- File này hiện tại để trống, có thể thêm permissions đặc biệt khi cần

