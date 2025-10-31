BEGIN;

-- Ensure gen_random_uuid is available (best-effort)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'gen_random_uuid') THEN
    BEGIN
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END$$;

-- dynamic_entities (self-referential)
CREATE TABLE IF NOT EXISTS public.dynamic_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(100) NOT NULL,
  name jsonb NOT NULL,
  description jsonb,
  model varchar(100) NOT NULL,
  data_type varchar(30) NOT NULL,
  options jsonb,
  default_value jsonb,
  is_required boolean NOT NULL DEFAULT false,
  validation jsonb,
  use_in jsonb,
  is_active boolean NOT NULL DEFAULT true,
  "order" integer NOT NULL DEFAULT 0,
  parent_id uuid NULL,
  created_at timestamptz,
  updated_at timestamptz,
  created_by varchar(36),
  updated_by varchar(36)
);

-- self FK (parent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'dynamic_entities_parent_id_dynamic_entities_id_fk'
  ) THEN
    ALTER TABLE public.dynamic_entities
      ADD CONSTRAINT dynamic_entities_parent_id_dynamic_entities_id_fk
      FOREIGN KEY (parent_id) REFERENCES public.dynamic_entities(id);
  END IF;
END$$;

-- unique per model + code
CREATE UNIQUE INDEX IF NOT EXISTS uq_dynamic_entities_model_code
  ON public.dynamic_entities(model, code);

-- helpful indexes
CREATE INDEX IF NOT EXISTS idx_dynamic_entities_parent ON public.dynamic_entities(parent_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_entities_model ON public.dynamic_entities(model);
CREATE INDEX IF NOT EXISTS idx_dynamic_entities_active ON public.dynamic_entities(is_active);
CREATE INDEX IF NOT EXISTS idx_dynamic_entities_order ON public.dynamic_entities("order");

COMMIT;


