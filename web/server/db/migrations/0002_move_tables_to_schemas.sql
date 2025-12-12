-- Migration: Move tables from public schema to module-specific schemas
-- Di chuyển các bảng từ schema public sang các schemas theo module

-- ============================================
-- Base Module (md_base)
-- ============================================
ALTER TABLE IF EXISTS "public"."users" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."users_login" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."sessions" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."currencies" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."currency_exchange_rate_for_vnd" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."dynamic_entities" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."location_countries" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."location_administrative_units" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."payment_terms" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."payment_methods" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."shipping_terms" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."shipping_methods" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."tax_rates" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."guidelines" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."news" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."order_currency_rates" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."sales_order_deliveries" SET SCHEMA "md_base";
ALTER TABLE IF EXISTS "public"."sales_order_delivery_lines" SET SCHEMA "md_base";

-- ============================================
-- HRM Module (mdl_hrm)
-- ============================================
ALTER TABLE IF EXISTS "public"."hrm_leave_types" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_roles" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_workflows" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_workflow_instances" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_workflow_approvals" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_documents" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_audit_logs" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_employees" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_candidates" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_departments" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_positions" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_contracts" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_job_requisitions" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_leave_requests" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_payrolls" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_shifts" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_timesheets" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_rosters" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_payroll_periods" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_payroll_rules" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_performance_reviews" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_onboarding_checklists" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_leave_balances" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_employee_benefits" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_employee_roles" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_employee_trainings" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_employee_histories" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_goals" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_interviews" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_notifications" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_offboardings" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_courses" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_compliance_reports" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_certificates" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_benefit_packages" SET SCHEMA "mdl_hrm";
ALTER TABLE IF EXISTS "public"."hrm_offers" SET SCHEMA "mdl_hrm";

-- ============================================
-- Product Module (mdl_product)
-- ============================================
ALTER TABLE IF EXISTS "public"."product_masters" SET SCHEMA "mdl_product";
ALTER TABLE IF EXISTS "public"."product_categories" SET SCHEMA "mdl_product";
ALTER TABLE IF EXISTS "public"."product_variants" SET SCHEMA "mdl_product";
ALTER TABLE IF EXISTS "public"."product_attributes" SET SCHEMA "mdl_product";
ALTER TABLE IF EXISTS "public"."product_packings" SET SCHEMA "mdl_product";
ALTER TABLE IF EXISTS "public"."units_of_measure" SET SCHEMA "mdl_product";
ALTER TABLE IF EXISTS "public"."uom_conversions" SET SCHEMA "mdl_product";
ALTER TABLE IF EXISTS "public"."product_type_service" SET SCHEMA "mdl_product";
ALTER TABLE IF EXISTS "public"."product_type_goods" SET SCHEMA "mdl_product";
ALTER TABLE IF EXISTS "public"."product_type_finished_good" SET SCHEMA "mdl_product";
ALTER TABLE IF EXISTS "public"."product_type_raw_material" SET SCHEMA "mdl_product";
ALTER TABLE IF EXISTS "public"."product_type_consumable" SET SCHEMA "mdl_product";
ALTER TABLE IF EXISTS "public"."product_type_tool" SET SCHEMA "mdl_product";
ALTER TABLE IF EXISTS "public"."product_type_asset" SET SCHEMA "mdl_product";

-- ============================================
-- Stock Module (mdl_stock)
-- ============================================
ALTER TABLE IF EXISTS "public"."stock_warehouses" SET SCHEMA "mdl_stock";
ALTER TABLE IF EXISTS "public"."stock_levels" SET SCHEMA "mdl_stock";
ALTER TABLE IF EXISTS "public"."stock_moves" SET SCHEMA "mdl_stock";
ALTER TABLE IF EXISTS "public"."stock_lots" SET SCHEMA "mdl_stock";
ALTER TABLE IF EXISTS "public"."stock_settings" SET SCHEMA "mdl_stock";
ALTER TABLE IF EXISTS "public"."stock_lot_moves" SET SCHEMA "mdl_stock";
ALTER TABLE IF EXISTS "public"."cost_variances" SET SCHEMA "mdl_stock";

-- ============================================
-- B2B Sales Module (mdl_sale_b2b)
-- ============================================
ALTER TABLE IF EXISTS "public"."customer_companies" SET SCHEMA "mdl_sale_b2b";
ALTER TABLE IF EXISTS "public"."customer_individuals" SET SCHEMA "mdl_sale_b2b";
ALTER TABLE IF EXISTS "public"."sales_orders_b2b" SET SCHEMA "mdl_sale_b2b";
ALTER TABLE IF EXISTS "public"."sales_order_lines_b2b" SET SCHEMA "mdl_sale_b2b";

-- ============================================
-- B2C Sales Module (mdl_sale_b2c)
-- ============================================
ALTER TABLE IF EXISTS "public"."sales_orders_b2c" SET SCHEMA "mdl_sale_b2c";
ALTER TABLE IF EXISTS "public"."sales_order_lines_b2c" SET SCHEMA "mdl_sale_b2c";
ALTER TABLE IF EXISTS "public"."price_lists_b2c" SET SCHEMA "mdl_sale_b2c";
ALTER TABLE IF EXISTS "public"."price_list_items_b2c" SET SCHEMA "mdl_sale_b2c";
ALTER TABLE IF EXISTS "public"."pricing_rules_b2c" SET SCHEMA "mdl_sale_b2c";
ALTER TABLE IF EXISTS "public"."price_tiers_b2c" SET SCHEMA "mdl_sale_b2c";

-- ============================================
-- Purchase Module (mdl_purchase)
-- ============================================
ALTER TABLE IF EXISTS "public"."purchase_orders" SET SCHEMA "mdl_purchase";
ALTER TABLE IF EXISTS "public"."purchase_order_lines" SET SCHEMA "mdl_purchase";

-- Note: After moving tables, foreign key constraints will need to be updated
-- to reference the new schema-qualified table names. This will be handled
-- in a separate migration or by recreating the constraints.

