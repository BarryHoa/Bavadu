BEGIN;

DO $$
DECLARE cnt int;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.product_categories;
  IF cnt = 0 THEN
    INSERT INTO public.product_categories (id, code, name, description, parent_id, level, is_active, created_at, updated_at)
    VALUES
      (gen_random_uuid(), 'CAT001', '{"en":"Electronics","vi":"Điện tử"}', '{"en":"All electronics"}', NULL, 1, true, now(), now()),
      (gen_random_uuid(), 'CAT002', '{"en":"Home","vi":"Gia dụng"}', '{"en":"Home and kitchen"}', NULL, 1, true, now(), now()),
      (gen_random_uuid(), 'CAT003', '{"en":"Fashion","vi":"Thời trang"}', '{"en":"Clothes and accessories"}', NULL, 1, true, now(), now()),
      (gen_random_uuid(), 'CAT004', '{"en":"Sports","vi":"Thể thao"}', '{"en":"Sporting goods"}', NULL, 1, true, now(), now()),
      (gen_random_uuid(), 'CAT005', '{"en":"Beauty","vi":"Làm đẹp"}', '{"en":"Beauty & personal care"}', NULL, 1, true, now(), now());
  END IF;
END$$;

COMMIT;


