-- Migration: Seed root category
-- Tạo danh mục gốc mặc định cho sản phẩm

INSERT INTO "mdl_product"."categories" (
	"code",
	"name",
	"description",
	"parent_id",
	"level",
	"is_active",
	"created_at",
	"updated_at"
) VALUES (
	'root',
	'{"en": "Root Category", "vi": "Danh mục gốc"}',
	'{"en": "Default root category for product hierarchy", "vi": "Danh mục gốc mặc định cho cây sản phẩm"}',
	NULL,
	0,
	true,
	now(),
	now()
) ON CONFLICT ("code") DO NOTHING;
