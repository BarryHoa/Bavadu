BEGIN;

DO $$
DECLARE cnt int;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.product_attributes;
  IF cnt = 0 THEN
    INSERT INTO public.product_attributes (id, code, name, value, created_at, updated_at)
    VALUES
      (gen_random_uuid(), 'color', '{"en":"Color"}', 'red', now(), now()),
      (gen_random_uuid(), 'size', '{"en":"Size"}', 'M', now(), now()),
      (gen_random_uuid(), 'material', '{"en":"Material"}', 'cotton', now(), now()),
      (gen_random_uuid(), 'origin', '{"en":"Origin"}', 'VN', now(), now()),
      (gen_random_uuid(), 'warranty', '{"en":"Warranty"}', '12m', now(), now());
  END IF;
END$$;

COMMIT;


