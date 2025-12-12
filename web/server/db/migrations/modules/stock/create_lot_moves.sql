-- Migration: Create lot_moves table
-- Tạo bảng lot_moves

CREATE TABLE "mdl_stock"."lot_moves" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"stock_move_id" uuid NOT NULL,
	"stock_lot_id" uuid NOT NULL,
	"quantity" numeric(14, 2) NOT NULL,
	"unit_cost" numeric(18, 4) NOT NULL,
	"total_cost" numeric(18, 4) NOT NULL,
	"move_type" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
