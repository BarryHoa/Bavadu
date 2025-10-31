BEGIN;

-- Ensure gen_random_uuid available (best-effort)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'gen_random_uuid') THEN
    BEGIN
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END$$;

-- product_categories
CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(50) NOT NULL UNIQUE,
  name jsonb NOT NULL,
  description jsonb,
  parent_id uuid NULL,
  level integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz,
  updated_at timestamptz,
  created_by varchar(36),
  updated_by varchar(36)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_categories_parent_id_product_categories_id_fk'
  ) THEN
    ALTER TABLE public.product_categories
      ADD CONSTRAINT product_categories_parent_id_product_categories_id_fk
      FOREIGN KEY (parent_id) REFERENCES public.product_categories(id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON public.product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_level ON public.product_categories(level);

COMMIT;


