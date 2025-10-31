BEGIN;

-- uom_conversions
CREATE TABLE IF NOT EXISTS public.uom_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uom_id uuid NOT NULL,
  conversion_ratio numeric(15,6) NOT NULL,
  created_at timestamptz,
  updated_at timestamptz
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uom_conversions_uom_id_units_of_measure_id_fk'
  ) THEN
    ALTER TABLE public.uom_conversions
      ADD CONSTRAINT uom_conversions_uom_id_units_of_measure_id_fk
      FOREIGN KEY (uom_id) REFERENCES public.units_of_measure(id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_uom_conversions_uom ON public.uom_conversions(uom_id);

COMMIT;


