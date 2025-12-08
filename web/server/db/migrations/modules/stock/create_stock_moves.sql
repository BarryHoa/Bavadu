-- Migration: Create stock_moves table
-- Tạo bảng stock_moves

-- ============================================
-- Stock Moves
-- ============================================
CREATE TABLE IF NOT EXISTS "stock_moves" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" numeric(14, 2) NOT NULL,
	"type" varchar(32) NOT NULL,
	"source_warehouse_id" uuid,
	"target_warehouse_id" uuid,
	"reference" varchar(128),
	"note" varchar(256),
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36)
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_product_id_product_masters_id_fk" 
FOREIGN KEY ("product_id") REFERENCES "public"."product_masters"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_source_warehouse_id_stock_warehouses_id_fk" 
FOREIGN KEY ("source_warehouse_id") REFERENCES "public"."stock_warehouses"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_target_warehouse_id_stock_warehouses_id_fk" 
FOREIGN KEY ("target_warehouse_id") REFERENCES "public"."stock_warehouses"("id") ON DELETE set null ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "stock_moves_product_idx" ON "stock_moves" USING btree ("product_id");
CREATE INDEX IF NOT EXISTS "stock_moves_type_idx" ON "stock_moves" USING btree ("type");
CREATE INDEX IF NOT EXISTS "stock_moves_source_idx" ON "stock_moves" USING btree ("source_warehouse_id");
CREATE INDEX IF NOT EXISTS "stock_moves_target_idx" ON "stock_moves" USING btree ("target_warehouse_id");
CREATE INDEX IF NOT EXISTS "stock_moves_created_idx" ON "stock_moves" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "stock_moves_product_type_idx" ON "stock_moves" USING btree ("product_id","type");
CREATE INDEX IF NOT EXISTS "stock_moves_product_created_idx" ON "stock_moves" USING btree ("product_id","created_at");
CREATE INDEX IF NOT EXISTS "stock_moves_source_created_idx" ON "stock_moves" USING btree ("source_warehouse_id","created_at");
CREATE INDEX IF NOT EXISTS "stock_moves_target_created_idx" ON "stock_moves" USING btree ("target_warehouse_id","created_at");

