BEGIN;

DO $$
DECLARE cnt int;
DECLARE v1 uuid;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.product_attributes;
  IF cnt = 0 THEN
    SELECT id INTO v1 FROM public.product_variants ORDER BY sku LIMIT 1;
    INSERT INTO public.product_attributes (id, entity_type, entity_id, code, name, value, created_at, updated_at)
    VALUES
      (gen_random_uuid(), 'variant', v1, 'color', '{"en":"Color"}', 'red', now(), now()),
      (gen_random_uuid(), 'variant', v1, 'size', '{"en":"Size"}', 'M', now(), now()),
      (gen_random_uuid(), 'variant', v1, 'material', '{"en":"Material"}', 'cotton', now(), now()),
      (gen_random_uuid(), 'variant', v1, 'origin', '{"en":"Origin"}', 'VN', now(), now()),
      (gen_random_uuid(), 'variant', v1, 'warranty', '{"en":"Warranty"}', '12m', now(), now());
  END IF;
END$$;

COMMIT;


