BEGIN;

-- units_of_measure
CREATE TABLE IF NOT EXISTS public.units_of_measure (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name jsonb NOT NULL,
  symbol varchar(20),
  is_active boolean DEFAULT true,
  created_at timestamptz,
  updated_at timestamptz
);

COMMIT;


