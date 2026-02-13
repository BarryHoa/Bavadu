-- Migration: Seed default warehouse
-- Tạo kho mặc định

INSERT INTO "mdl_stock"."warehouses" (
	"code",
	"name",
	"type_code",
	"status",
	"address",
	"valuation_method",
	"min_stock",
	"created_at",
	"updated_at"
)
SELECT
	'WH-01',
	'Kho chính',
	'main',
	'ACTIVE',
	'{}'::jsonb,
	'FIFO',
	0,
	now(),
	now()
WHERE NOT EXISTS (SELECT 1 FROM "mdl_stock"."warehouses" WHERE "code" = 'WH-01');
