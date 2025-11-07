BEGIN;

DO $$
DECLARE cnt int;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.units_of_measure;
  IF cnt = 0 THEN
    INSERT INTO public.units_of_measure (id, name, symbol, is_active, created_at, updated_at)
    VALUES
      (gen_random_uuid(), '{"en":"Piece","vi":"Cái"}', 'pc', true, now(), now()),
      (gen_random_uuid(), '{"en":"Kilogram","vi":"Kilôgam"}', 'kg', true, now(), now()),
      (gen_random_uuid(), '{"en":"Gram","vi":"Gam"}', 'g', true, now(), now()),
      (gen_random_uuid(), '{"en":"Liter","vi":"Lít"}', 'L', true, now(), now()),
      (gen_random_uuid(), '{"en":"Meter","vi":"Mét"}', 'm', true, now(), now());
  END IF;
END$$;

-- create a couple of conversions if empty
DO $$
DECLARE cnt int;
DECLARE kg uuid; DECLARE g uuid;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.uom_conversions;
  IF cnt = 0 THEN
    SELECT id INTO kg FROM public.units_of_measure WHERE symbol='kg' LIMIT 1;
    SELECT id INTO g FROM public.units_of_measure WHERE symbol='g' LIMIT 1;
    IF kg IS NOT NULL AND g IS NOT NULL THEN
      INSERT INTO public.uom_conversions (id, uom_id, conversion_ratio, created_at, updated_at)
      VALUES
        (gen_random_uuid(), kg, 1.0, now(), now()),
        (gen_random_uuid(), g, 0.001, now(), now()),
        (gen_random_uuid(), kg, 1.0, now(), now()),
        (gen_random_uuid(), g, 0.001, now(), now()),
        (gen_random_uuid(), kg, 1.0, now(), now());
    END IF;
  END IF;
END$$;

COMMIT;


