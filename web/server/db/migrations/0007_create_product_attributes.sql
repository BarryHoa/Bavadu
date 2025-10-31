BEGIN;

-- product_attributes
CREATE TABLE IF NOT EXISTS public.product_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(100) NOT NULL,
  name jsonb NOT NULL,
  value text NULL,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_attributes_entity_code
  ON public.product_attributes(entity_type, entity_id, code);

CREATE INDEX IF NOT EXISTS idx_product_attributes_entity
  ON public.product_attributes(entity_type, entity_id);

COMMIT;


