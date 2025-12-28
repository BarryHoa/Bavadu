export enum StockMoveAction {
  INBOUND = "INBOUND",
  OUTBOUND = "OUTBOUND",
  TRANSFER = "TRANSFER",
}

export enum StockMoveFrom {
  PURCHASE = "PURCHASE",
  PRODUCTION = "PRODUCTION",
  RETURN = "RETURN",
  TRANSFER = "TRANSFER",
  ADJUSTMENT = "ADJUSTMENT",
  SALES_B2B = "SALES_B2B",
  SALES_B2C = "SALES_B2C",
  RETAIL = "RETAIL",
  DEALER = "DEALER",
  PRODUCTION_ISSUE = "PRODUCTION_ISSUE",
  EVENT = "EVENT",
  LOSS = "LOSS",
  ADJUSTMENT_DECREASE = "ADJUSTMENT_DECREASE",
}

export type StockMoveType =
  | `${StockMoveAction.INBOUND}_${StockMoveFrom.PURCHASE}`
  | `${StockMoveAction.INBOUND}_${StockMoveFrom.PRODUCTION}`
  | `${StockMoveAction.INBOUND}_${StockMoveFrom.RETURN}`
  | `${StockMoveAction.INBOUND}_${StockMoveFrom.TRANSFER}`
  | `${StockMoveAction.INBOUND}_${StockMoveFrom.ADJUSTMENT}`
  | `${StockMoveAction.OUTBOUND}_${StockMoveFrom.SALES_B2B}`
  | `${StockMoveAction.OUTBOUND}_${StockMoveFrom.SALES_B2C}`
  | `${StockMoveAction.OUTBOUND}_${StockMoveFrom.RETAIL}`
  | `${StockMoveAction.OUTBOUND}_${StockMoveFrom.DEALER}`
  | `${StockMoveAction.OUTBOUND}_${StockMoveFrom.PRODUCTION_ISSUE}`
  | `${StockMoveAction.OUTBOUND}_${StockMoveFrom.EVENT}`
  | `${StockMoveAction.OUTBOUND}_${StockMoveFrom.LOSS}`
  | `${StockMoveAction.OUTBOUND}_${StockMoveFrom.ADJUSTMENT_DECREASE}`
  | `${StockMoveAction.TRANSFER}_${StockMoveFrom.TRANSFER}`;

export function createStockMoveType(
  action: StockMoveAction,
  from: StockMoveFrom
): StockMoveType {
  return `${action}_${from}` as StockMoveType;
}

export const StockMoveTypes = {
  INBOUND_PURCHASE: createStockMoveType(
    StockMoveAction.INBOUND,
    StockMoveFrom.PURCHASE
  ),
  INBOUND_PRODUCTION: createStockMoveType(
    StockMoveAction.INBOUND,
    StockMoveFrom.PRODUCTION
  ),
  INBOUND_RETURN: createStockMoveType(
    StockMoveAction.INBOUND,
    StockMoveFrom.RETURN
  ),
  INBOUND_TRANSFER: createStockMoveType(
    StockMoveAction.INBOUND,
    StockMoveFrom.TRANSFER
  ),
  INBOUND_ADJUSTMENT: createStockMoveType(
    StockMoveAction.INBOUND,
    StockMoveFrom.ADJUSTMENT
  ),
  OUTBOUND_SALES_B2B: createStockMoveType(
    StockMoveAction.OUTBOUND,
    StockMoveFrom.SALES_B2B
  ),
  OUTBOUND_SALES_B2C: createStockMoveType(
    StockMoveAction.OUTBOUND,
    StockMoveFrom.SALES_B2C
  ),
  OUTBOUND_RETAIL: createStockMoveType(
    StockMoveAction.OUTBOUND,
    StockMoveFrom.RETAIL
  ),
  OUTBOUND_DEALER: createStockMoveType(
    StockMoveAction.OUTBOUND,
    StockMoveFrom.DEALER
  ),
  OUTBOUND_PRODUCTION: createStockMoveType(
    StockMoveAction.OUTBOUND,
    StockMoveFrom.PRODUCTION_ISSUE
  ),
  OUTBOUND_EVENT: createStockMoveType(
    StockMoveAction.OUTBOUND,
    StockMoveFrom.EVENT
  ),
  OUTBOUND_LOSS: createStockMoveType(
    StockMoveAction.OUTBOUND,
    StockMoveFrom.LOSS
  ),
  OUTBOUND_ADJUSTMENT: createStockMoveType(
    StockMoveAction.OUTBOUND,
    StockMoveFrom.ADJUSTMENT_DECREASE
  ),
  TRANSFER_WAREHOUSE: createStockMoveType(
    StockMoveAction.TRANSFER,
    StockMoveFrom.TRANSFER
  ),
} as const;
