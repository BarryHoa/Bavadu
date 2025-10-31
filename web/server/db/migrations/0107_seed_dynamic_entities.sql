BEGIN;

DO $$
DECLARE cnt int;
DECLARE parent uuid;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.dynamic_entities;
  IF cnt = 0 THEN
    parent := gen_random_uuid();
    INSERT INTO public.dynamic_entities (id, code, name, model, data_type, is_required, is_active, "order", created_at, updated_at)
    VALUES
      (parent, 'custom_field_group', '{"en":"Custom Group"}', 'product_variant', 'string', false, true, 0, now(), now());

    INSERT INTO public.dynamic_entities (id, code, name, model, data_type, options, is_required, is_active, "order", parent_id, created_at, updated_at)
    VALUES
      (gen_random_uuid(), 'color', '{"en":"Color"}', 'product_variant', 'select', '{"options":[{"label":{"en":"Red"},"value":"red"}]}', false, true, 1, parent, now(), now()),
      (gen_random_uuid(), 'size', '{"en":"Size"}', 'product_variant', 'string', NULL, false, true, 2, parent, now(), now()),
      (gen_random_uuid(), 'material', '{"en":"Material"}', 'product_variant', 'string', NULL, false, true, 3, parent, now(), now()),
      (gen_random_uuid(), 'origin', '{"en":"Origin"}', 'product_variant', 'string', NULL, false, true, 4, parent, now(), now());
  END IF;
END$$;

COMMIT;


