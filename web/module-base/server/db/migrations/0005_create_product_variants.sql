BEGIN;

-- product_variants
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_master_id uuid NOT NULL,
  name jsonb NOT NULL,
  description jsonb,
  image text,
  sku varchar(100),
  barcode varchar(100),
  manufacturer jsonb,
  base_uom_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz,
  updated_at timestamptz,
  created_by varchar(36),
  updated_by varchar(36)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_variants_product_master_id_product_masters_id_fk'
  ) THEN
    ALTER TABLE public.product_variants
      ADD CONSTRAINT product_variants_product_master_id_product_masters_id_fk
      FOREIGN KEY (product_master_id) REFERENCES public.product_masters(id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_variants_base_uom_id_units_of_measure_id_fk'
  ) THEN
    ALTER TABLE public.product_variants
      ADD CONSTRAINT product_variants_base_uom_id_units_of_measure_id_fk
      FOREIGN KEY (base_uom_id) REFERENCES public.units_of_measure(id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_product_variants_master ON public.product_variants(product_master_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);

COMMIT;


