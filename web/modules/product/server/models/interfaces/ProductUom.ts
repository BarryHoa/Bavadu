import { LocaleDataType } from "@base/server/interfaces/Locale";

export type UnitOfMeasure = {
  id: string; // uuid v7
  name: LocaleDataType<string>;
  symbol?: string;
  isActive?: boolean;
  createdAt?: number; // unix timestamp (ms)
  updatedAt?: number; // unix timestamp (ms)
};

// ========================================
//  Uom conversion
// ========================================
export type UnitOfMeasureConversion = {
  id: string; // uuid v7
  uomId: string;
  conversionRatio: number;
  createdAt?: number; // unix timestamp (ms)
  updatedAt?: number; // unix timestamp (ms)
};
