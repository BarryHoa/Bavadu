-- Migration: Create stock_lot_moves table
-- Tạo bảng stock_lot_moves

-- ============================================
-- Stock Lot Moves
-- ============================================
CREATE TABLE IF NOT EXISTS "stock_lot_moves" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"stock_move_id" uuid NOT NULL,
	"stock_lot_id" uuid NOT NULL,
	"quantity" numeric(14, 2) NOT NULL,
	"unit_cost" numeric(18, 4) NOT NULL,
	"total_cost" numeric(18, 4) NOT NULL,
	"move_type" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "stock_lot_moves" ADD CONSTRAINT "stock_lot_moves_stock_move_id_stock_moves_id_fk" 
FOREIGN KEY ("stock_move_id") REFERENCES "public"."stock_moves"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "stock_lot_moves" ADD CONSTRAINT "stock_lot_moves_stock_lot_id_stock_lots_id_fk" 
FOREIGN KEY ("stock_lot_id") REFERENCES "public"."stock_lots"("id") ON DELETE cascade ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "stock_lot_moves_stock_move_idx" ON "stock_lot_moves" USING btree ("stock_move_id");
CREATE INDEX IF NOT EXISTS "stock_lot_moves_stock_lot_idx" ON "stock_lot_moves" USING btree ("stock_lot_id");
CREATE INDEX IF NOT EXISTS "stock_lot_moves_type_idx" ON "stock_lot_moves" USING btree ("move_type");

