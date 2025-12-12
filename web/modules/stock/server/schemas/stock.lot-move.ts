import { sql } from "drizzle-orm";
import {
  index,
  numeric,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlStockSchema } from "./schema";
import { table_stock_lot } from "./stock.lot";
import { table_stock_move } from "./stock.move";

// Stock Lot Moves - Theo dõi xuất từ lot nào
export const table_stock_lot_move = mdlStockSchema.table(
  "lot_moves",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),

    // Link to stock move
    stockMoveId: uuid("stock_move_id")
      .notNull()
      .references(() => table_stock_move.id, { onDelete: "cascade" }),

    // Link to lot
    stockLotId: uuid("stock_lot_id")
      .notNull()
      .references(() => table_stock_lot.id, { onDelete: "cascade" }),

    // Quantity & Cost
    quantity: numeric("quantity", { precision: 14, scale: 2 }).notNull(),
    unitCost: numeric("unit_cost", { precision: 18, scale: 4 }).notNull(), // Giá vốn tại thời điểm xuất
    totalCost: numeric("total_cost", { precision: 18, scale: 4 }).notNull(), // quantity * unitCost

    // Movement type
    moveType: varchar("move_type", { length: 20 }).notNull(), // inbound, outbound, transfer

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("lot_moves_stock_move_idx").on(table.stockMoveId),
    index("lot_moves_stock_lot_idx").on(table.stockLotId),
    index("lot_moves_type_idx").on(table.moveType),
  ]
);

export type TblStockLotMove = typeof table_stock_lot_move.$inferSelect;
export type NewTblStockLotMove = typeof table_stock_lot_move.$inferInsert;

