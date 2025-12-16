export interface MovementResult {
  type: "success" | "error";
  message: string;
}

export interface StockFilters {
  productId?: string;
  warehouseId?: string;
}

export type AdjustPayload = {
  productId: string;
  warehouseId: string;
  quantityDelta: number;
  reference?: string;
  note?: string;
};

export type InOutPayload = {
  productId: string;
  warehouseId: string;
  quantity: number;
  reference?: string;
  note?: string;
};

export type TransferPayload = {
  productId: string;
  sourceWarehouseId: string;
  targetWarehouseId: string;
  quantity: number;
  reference?: string;
  note?: string;
};

export type MovementPayload = {
  productId: string;
  quantity: string;
  reference?: string;
  note?: string;
  primaryWarehouseId: string;
  secondaryWarehouseId?: string;
};
