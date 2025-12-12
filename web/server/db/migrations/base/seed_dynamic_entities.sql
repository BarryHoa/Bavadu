-- Seed data for dynamic_entities table

INSERT INTO "md_base"."dynamic_entities" (
  "code",
  "name",
  "description",
  "model",
  "data_type",
  "options",
  "default_value",
  "is_required",
  "validation",
  "use_in",
  "is_active",
  "order",
  "parent_id",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  CONCAT('DE', LPAD(gs::text, 3, '0')),
  jsonb_build_object('en', CONCAT('Dynamic Field ', gs), 'vi', CONCAT('Trường động ', gs)),
  jsonb_build_object('en', CONCAT('Description for dynamic field ', gs), 'vi', CONCAT('Mô tả cho trường ', gs)),
  (ARRAY['product', 'customer', 'supplier', 'order'])[((gs - 1) % 4) + 1],
  (ARRAY['string', 'number', 'boolean', 'date', 'select'])[((gs - 1) % 5) + 1],
  CASE
    WHEN gs % 5 = 0 THEN jsonb_build_array(jsonb_build_object('label', jsonb_build_object('en', 'Option A', 'vi', 'Tuỳ chọn A'), 'value', 'A'))
    ELSE NULL
  END,
  NULL,
  gs % 2 = 0,
  CASE WHEN gs % 3 = 0 THEN jsonb_build_array(jsonb_build_object('rule', 'required')) ELSE NULL END,
  jsonb_build_object('report', gs % 2 = 0, 'list', TRUE, 'filter', gs % 3 = 0),
  TRUE,
  gs,
  NULL,
  NOW(),
  NOW(),
  NULL,
  NULL
FROM generate_series(1, 20) AS gs;

