BEGIN;

-- product_masters
CREATE TABLE IF NOT EXISTS public.product_masters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(100) NOT NULL UNIQUE,
  name jsonb NOT NULL,
  type varchar(20) NOT NULL,
  features jsonb,
  is_active boolean NOT NULL DEFAULT true,
  brand jsonb,
  category_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  created_by varchar(36),
  updated_by varchar(36)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_masters_category_id_product_categories_id_fk'
  ) THEN
    ALTER TABLE public.product_masters
      ADD CONSTRAINT product_masters_category_id_product_categories_id_fk
      FOREIGN KEY (category_id) REFERENCES public.product_categories(id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_product_masters_category ON public.product_masters(category_id);

COMMIT;


