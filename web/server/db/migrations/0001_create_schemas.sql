-- Migration: Create PostgreSQL schemas for module separation
-- Tạo các schemas PostgreSQL để tách biệt theo module

-- ============================================
-- Create Schemas
-- ============================================

-- Base module schema
CREATE SCHEMA IF NOT EXISTS "md_base";

-- HRM module schema
CREATE SCHEMA IF NOT EXISTS "mdl_hrm";

-- Product module schema
CREATE SCHEMA IF NOT EXISTS "mdl_product";

-- Stock module schema
CREATE SCHEMA IF NOT EXISTS "mdl_stock";

-- B2B Sales module schema
CREATE SCHEMA IF NOT EXISTS "mdl_sale_b2b";

-- B2C Sales module schema
CREATE SCHEMA IF NOT EXISTS "mdl_sale_b2c";

-- Purchase module schema
CREATE SCHEMA IF NOT EXISTS "mdl_purchase";

-- Grant permissions (adjust as needed for your security requirements)
-- GRANT USAGE ON SCHEMA "md_base" TO your_app_user;
-- GRANT USAGE ON SCHEMA "mdl_hrm" TO your_app_user;
-- GRANT USAGE ON SCHEMA "mdl_product" TO your_app_user;
-- GRANT USAGE ON SCHEMA "mdl_stock" TO your_app_user;
-- GRANT USAGE ON SCHEMA "mdl_sale_b2b" TO your_app_user;
-- GRANT USAGE ON SCHEMA "mdl_sale_b2c" TO your_app_user;
-- GRANT USAGE ON SCHEMA "mdl_purchase" TO your_app_user;

