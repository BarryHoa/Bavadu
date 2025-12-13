-- Migration: Convert description columns from jsonb to text
-- This migration converts all description fields from jsonb to text type
-- For jsonb objects, it extracts the first available locale value (preferring 'en', then 'vi')

-- Helper function to extract text from jsonb description
CREATE OR REPLACE FUNCTION extract_text_from_jsonb(jsonb_val jsonb)
RETURNS text AS $$
BEGIN
  IF jsonb_val IS NULL THEN
    RETURN NULL;
  END IF;
  
  IF jsonb_typeof(jsonb_val) = 'string' THEN
    RETURN jsonb_val::text;
  END IF;
  
  IF jsonb_typeof(jsonb_val) = 'object' THEN
    RETURN COALESCE(
      jsonb_val->>'en',
      jsonb_val->>'vi',
      jsonb_val->>'ja',
      jsonb_val->>'zh',
      jsonb_val->>'ko',
      jsonb_val->>'th',
      jsonb_val->>'id',
      jsonb_val->>'ms',
      jsonb_val->>'fr',
      jsonb_val->>'de',
      jsonb_val->>'es',
      jsonb_val->>'pt',
      jsonb_val->>'ru',
      (jsonb_val::text)
    );
  END IF;
  
  RETURN jsonb_val::text;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Base module tables
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'md_base' AND table_name = 'roles') THEN
    ALTER TABLE "md_base"."roles" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'md_base' AND table_name = 'permissions') THEN
    ALTER TABLE "md_base"."permissions" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'md_base' AND table_name = 'tax_rates') THEN
    ALTER TABLE "md_base"."tax_rates" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'md_base' AND table_name = 'shipping_methods') THEN
    ALTER TABLE "md_base"."shipping_methods" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'md_base' AND table_name = 'payment_terms') THEN
    ALTER TABLE "md_base"."payment_terms" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'md_base' AND table_name = 'payment_methods') THEN
    ALTER TABLE "md_base"."payment_methods" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'md_base' AND table_name = 'dynamic_entities') THEN
    ALTER TABLE "md_base"."dynamic_entities" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'md_base' AND table_name = 'shipping_terms') THEN
    ALTER TABLE "md_base"."shipping_terms" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

-- HRM module tables
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mdl_hrm' AND table_name = 'departments') THEN
    ALTER TABLE "mdl_hrm"."departments" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mdl_hrm' AND table_name = 'positions') THEN
    ALTER TABLE "mdl_hrm"."positions" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mdl_hrm' AND table_name = 'leave_types') THEN
    ALTER TABLE "mdl_hrm"."leave_types" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mdl_hrm' AND table_name = 'workflows') THEN
    ALTER TABLE "mdl_hrm"."workflows" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mdl_hrm' AND table_name = 'shifts') THEN
    ALTER TABLE "mdl_hrm"."shifts" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mdl_hrm' AND table_name = 'payroll_rules') THEN
    ALTER TABLE "mdl_hrm"."payroll_rules" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mdl_hrm' AND table_name = 'job_requisitions') THEN
    ALTER TABLE "mdl_hrm"."job_requisitions" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mdl_hrm' AND table_name = 'documents') THEN
    ALTER TABLE "mdl_hrm"."documents" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mdl_hrm' AND table_name = 'goals') THEN
    ALTER TABLE "mdl_hrm"."goals" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mdl_hrm' AND table_name = 'benefit_packages') THEN
    ALTER TABLE "mdl_hrm"."benefit_packages" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mdl_hrm' AND table_name = 'courses') THEN
    ALTER TABLE "mdl_hrm"."courses" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mdl_hrm' AND table_name = 'onboarding_checklists') THEN
    ALTER TABLE "mdl_hrm"."onboarding_checklists" 
      ALTER COLUMN "task_description" TYPE text USING extract_text_from_jsonb("task_description");
  END IF;
END $$;

-- Product module tables
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mdl_product' AND table_name = 'categories') THEN
    ALTER TABLE "mdl_product"."categories" 
      ALTER COLUMN "description" TYPE text USING extract_text_from_jsonb("description");
  END IF;
END $$;

-- Clean up helper function
DROP FUNCTION IF EXISTS extract_text_from_jsonb(jsonb);

