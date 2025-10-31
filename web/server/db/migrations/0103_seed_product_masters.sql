BEGIN;

DO $$
DECLARE cnt int;
DECLARE cat1 uuid;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.product_masters;
  IF cnt = 0 THEN
    SELECT id INTO cat1 FROM public.product_categories ORDER BY code LIMIT 1;
    INSERT INTO public.product_masters (id, code, name, description, type, features, is_active, brand, category_id, created_at, updated_at)
    VALUES
      (gen_random_uuid(), 'PM001', '{"en":"Master 1"}', '{"en":"Desc 1"}', 'goods', '{"fragile":true}', true, '{"en":"Brand A"}', cat1, now(), now()),
      (gen_random_uuid(), 'PM002', '{"en":"Master 2"}', '{"en":"Desc 2"}', 'goods', '{"fragile":false}', true, '{"en":"Brand B"}', cat1, now(), now()),
      (gen_random_uuid(), 'PM003', '{"en":"Master 3"}', '{"en":"Desc 3"}', 'service', NULL, true, '{"en":"Brand C"}', cat1, now(), now()),
      (gen_random_uuid(), 'PM004', '{"en":"Master 4"}', '{"en":"Desc 4"}', 'goods', NULL, true, '{"en":"Brand D"}', cat1, now(), now()),
      (gen_random_uuid(), 'PM005', '{"en":"Master 5"}', '{"en":"Desc 5"}', 'goods', NULL, true, '{"en":"Brand E"}', cat1, now(), now());
  END IF;
END$$;

COMMIT;


