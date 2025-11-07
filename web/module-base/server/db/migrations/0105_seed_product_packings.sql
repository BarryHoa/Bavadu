BEGIN;

DO $$
DECLARE cnt int;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.product_packings;
  IF cnt = 0 THEN
    INSERT INTO public.product_packings (id, name, description, is_active, created_at, updated_at)
    VALUES
      (gen_random_uuid(), '{"en":"Box"}', '{"en":"Cardboard box"}', true, now(), now()),
      (gen_random_uuid(), '{"en":"Bag"}', '{"en":"Plastic bag"}', true, now(), now()),
      (gen_random_uuid(), '{"en":"Bottle"}', '{"en":"Plastic bottle"}', true, now(), now()),
      (gen_random_uuid(), '{"en":"Can"}', '{"en":"Aluminum can"}', true, now(), now()),
      (gen_random_uuid(), '{"en":"Pack"}', '{"en":"Retail pack"}', true, now(), now());
  END IF;
END$$;

COMMIT;


