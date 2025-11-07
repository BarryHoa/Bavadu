BEGIN;

DO $$
DECLARE cnt int;
DECLARE pm uuid; DECLARE uom uuid;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.product_variants;
  IF cnt = 0 THEN
    SELECT id INTO pm FROM public.product_masters ORDER BY code LIMIT 1;
    SELECT id INTO uom FROM public.units_of_measure ORDER BY symbol LIMIT 1;
    INSERT INTO public.product_variants (id, product_master_id, name, description, images, sku, barcode, manufacturer, base_uom_id, is_active, created_at, updated_at)
    VALUES
      (gen_random_uuid(), pm, '{"en":"Variant 1"}', '{"en":"Desc 1"}', '["/img/v1.png"]'::jsonb, 'SKU001', 'BAR001', '{"name":{"en":"Maker"}}', uom, true, now(), now()),
      (gen_random_uuid(), pm, '{"en":"Variant 2"}', '{"en":"Desc 2"}', '["/img/v2.png"]'::jsonb, 'SKU002', 'BAR002', '{"name":{"en":"Maker"}}', uom, true, now(), now()),
      (gen_random_uuid(), pm, '{"en":"Variant 3"}', '{"en":"Desc 3"}', '["/img/v3.png"]'::jsonb, 'SKU003', 'BAR003', '{"name":{"en":"Maker"}}', uom, true, now(), now()),
      (gen_random_uuid(), pm, '{"en":"Variant 4"}', '{"en":"Desc 4"}', '["/img/v4.png"]'::jsonb, 'SKU004', 'BAR004', '{"name":{"en":"Maker"}}', uom, true, now(), now()),
      (gen_random_uuid(), pm, '{"en":"Variant 5"}', '{"en":"Desc 5"}', '["/img/v5.png"]'::jsonb, 'SKU005', 'BAR005', '{"name":{"en":"Maker"}}', uom, true, now(), now());
  END IF;
END$$;

COMMIT;


